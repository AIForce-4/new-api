package router

import (
	"bytes"
	"encoding/base64"
	"image"
	"image/png"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/setting"
	"github.com/QuantumNous/new-api/setting/billing_setting"
	"github.com/QuantumNous/new-api/setting/ratio_setting"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func TestImageMaxWorkshop(t *testing.T) {
	t.Setenv("SQL_DSN", "")
	t.Setenv("LOG_SQL_DSN", "")
	oldPath, oldMaster := common.SQLitePath, common.IsMasterNode
	oldDB, oldLogDB, oldSQLite := model.DB, model.LOG_DB, common.UsingSQLite
	oldLogConsume, oldBatch, oldRedis := common.LogConsumeEnabled, common.BatchUpdateEnabled, common.RedisEnabled
	t.Cleanup(func() {
		common.SQLitePath, common.IsMasterNode = oldPath, oldMaster
		model.DB, model.LOG_DB, common.UsingSQLite = oldDB, oldLogDB, oldSQLite
		common.LogConsumeEnabled, common.BatchUpdateEnabled, common.RedisEnabled = oldLogConsume, oldBatch, oldRedis
	})
	common.SQLitePath, common.IsMasterNode = filepath.Join(t.TempDir(), "image-max.db"), true
	common.LogConsumeEnabled, common.BatchUpdateEnabled, common.RedisEnabled = true, false, false
	require.NoError(t, model.InitDB())
	require.NoError(t, model.InitLogDB())
	db, err := model.DB.DB()
	require.NoError(t, err)
	t.Cleanup(func() { _ = db.Close() })
	service.InitHttpClient()
	ratio_setting.InitRatioSettings()
	usableGroups := setting.UserUsableGroups2JSONString()
	t.Cleanup(func() { _ = setting.UpdateUserUsableGroupsByJSONString(usableGroups) })
	oldRatios, err := common.Marshal(ratio_setting.GetGroupRatioCopy())
	require.NoError(t, err)
	t.Cleanup(func() { _ = ratio_setting.UpdateGroupRatioByJSONString(string(oldRatios)) })
	require.NoError(t, ratio_setting.UpdateGroupRatioByJSONString(`{"default":1,"GPT-Image-V2":1}`))

	price := `param("size") == "3840x2160" ? tier("4K", 650000.0) : tier("2K", 300000.0)`
	modes, prices := billing_setting.BillingMode2JSONString(), billing_setting.BillingExpr2JSONString()
	t.Cleanup(func() {
		_ = billing_setting.UpdateBillingModeByJSONString(modes)
		_ = billing_setting.UpdateBillingExprByJSONString(prices)
	})
	priceJSON, err := common.Marshal(map[string]string{constant.ImageMaxModel: price})
	require.NoError(t, err)
	require.NoError(t, billing_setting.UpdateBillingExprByJSONString(string(priceJSON)))
	require.NoError(t, billing_setting.UpdateBillingModeByJSONString(`{"`+constant.ImageMaxModel+`":"tiered_expr"}`))

	var picture bytes.Buffer
	require.NoError(t, png.Encode(&picture, image.NewRGBA(image.Rect(0, 0, 32, 32))))
	encoded := base64.StdEncoding.EncodeToString(picture.Bytes())
	forwarded := make(chan map[string]any, 3)
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.URL.Path != "/api/v3/images/generations" || r.Header.Get("Authorization") != "Bearer local-fixture" {
			t.Errorf("unexpected upstream request: %s %s", r.Method, r.URL.Path)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		var request map[string]any
		if err := common.DecodeJson(r.Body, &request); err != nil {
			t.Errorf("decode upstream request: %v", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		select {
		case forwarded <- request:
		default:
			t.Error("unexpected additional upstream generation")
		}
		w.Header().Set("Content-Type", "application/json")
		if request["prompt"] == "fail" {
			_, _ = w.Write([]byte(`{"model":"` + constant.ImageMaxModel + `","data":[]}`))
			return
		}
		_, _ = w.Write([]byte(`{"model":"` + constant.ImageMaxModel + `","data":[{"b64_json":"` + encoded + `"}],"usage":{"generated_images":1}}`))
	}))
	defer upstream.Close()

	channel := model.Channel{Type: constant.ChannelTypeVolcEngine, Status: common.ChannelStatusEnabled,
		Name: "private channel", Group: "GPT-Image-V2", Key: "local-fixture", Models: constant.ImageMaxModel + ",gpt-4o",
		BaseURL: common.GetPointer(upstream.URL), ParamOverride: common.GetPointer(`{"size":"3840x2160","watermark":true}`)}
	require.NoError(t, channel.Insert())
	account := model.User{Username: "max-workshop-test", Password: "local-fixture", Group: "default", Quota: 475000,
		Role: common.RoleCommonUser, Status: common.UserStatusEnabled, Setting: `{"billing_preference":"subscription_first"}`}
	require.NoError(t, model.DB.Create(&account).Error)
	plan := model.SubscriptionPlan{Title: "test", TotalAmount: 1000000, Enabled: true}
	require.NoError(t, model.DB.Create(&plan).Error)
	sub := model.UserSubscription{UserId: account.Id, PlanId: plan.Id, Status: "active", AmountTotal: 1000000,
		StartTime: time.Now().Add(-time.Hour).Unix(), EndTime: time.Now().Add(time.Hour).Unix()}
	require.NoError(t, model.DB.Create(&sub).Error)
	token := model.Token{UserId: account.Id, Key: "localfixturetoken", Status: common.TokenStatusEnabled,
		UnlimitedQuota: true, ExpiredTime: -1, ModelLimitsEnabled: true, ModelLimits: constant.ImageMaxModel + ",gpt-4o"}
	require.NoError(t, model.DB.Create(&token).Error)

	engine := gin.New()
	engine.Use(sessions.Sessions("session", cookie.NewStore([]byte("local-test-session-key"))))
	SetRelayRouter(engine)
	engine.GET("/api/pricing", controller.GetPricing)
	engine.GET("/test-login", func(c *gin.Context) {
		session := sessions.Default(c)
		session.Set("username", account.Username)
		session.Set("id", account.Id)
		session.Set("role", common.RoleCommonUser)
		session.Set("status", common.UserStatusEnabled)
		session.Set("group", account.Group)
		require.NoError(t, session.Save())
		c.Status(http.StatusNoContent)
	})
	login := httptest.NewRecorder()
	engine.ServeHTTP(login, httptest.NewRequest(http.MethodGet, "/test-login", nil))
	require.NotEmpty(t, login.Result().Cookies())

	generate := func(mode, prompt, size, format, background string, reference []byte, authenticated bool) *httptest.ResponseRecorder {
		t.Helper()
		var body bytes.Buffer
		form := multipart.NewWriter(&body)
		for key, value := range map[string]string{"mode": mode, "prompt": prompt, "size": size, "output_format": format,
			"background": background, "watermark": "true", "model": "caller-supplied", "layer_decomposition": "true"} {
			require.NoError(t, form.WriteField(key, value))
		}
		if reference != nil {
			file, err := form.CreateFormFile("image", "reference.png")
			require.NoError(t, err)
			_, err = file.Write(reference)
			require.NoError(t, err)
		}
		require.NoError(t, form.Close())
		request := httptest.NewRequest(http.MethodPost, constant.ImageMaxPath, &body)
		request.Header.Set("Content-Type", form.FormDataContentType())
		request.Header.Set("New-Api-User", strconv.Itoa(account.Id))
		if authenticated {
			request.AddCookie(login.Result().Cookies()[0])
		}
		rr := httptest.NewRecorder()
		engine.ServeHTTP(rr, request)
		return rr
	}
	wallet := func() int {
		t.Helper()
		var quota int
		require.NoError(t, model.DB.Model(&model.User{}).Where("id = ?", account.Id).Pluck("quota", &quota).Error)
		return quota
	}
	adjustAccount := func(quota int, preference string) {
		t.Helper()
		require.NoError(t, model.DB.Model(&account).Updates(map[string]any{"quota": quota,
			"setting": `{"billing_preference":"` + preference + `"}`}).Error)
	}
	apiTokenRequest := func(method, path, body string) *httptest.ResponseRecorder {
		t.Helper()
		r := httptest.NewRequest(method, path, strings.NewReader(body))
		r.Header.Set("Authorization", "Bearer sk-"+token.Key)
		r.Header.Set("Content-Type", "application/json")
		rr := httptest.NewRecorder()
		engine.ServeHTTP(rr, r)
		return rr
	}

	require.Equal(t, http.StatusUnauthorized, generate("text", "a flower", "2816x1584", "png", "auto", nil, false).Code)
	require.Equal(t, http.StatusBadRequest, generate("image", "a flower", "2816x1584", "png", "auto", nil, true).Code)
	require.Equal(t, http.StatusBadRequest, generate("image", "a flower", "2816x1584", "png", "auto", []byte("fake PNG"), true).Code)
	require.Equal(t, http.StatusBadRequest, generate("text", "a flower", "2816x1584", "jpeg", "transparent", nil, true).Code)
	for _, name := range []string{constant.ImageMaxModel, constant.ImageMaxName} {
		public := apiTokenRequest(http.MethodPost, "/v1/images/generations", `{"model":"`+name+`","prompt":"a flower"}`)
		require.Equal(t, http.StatusNotFound, public.Code, public.Body.String())
	}
	listing := apiTokenRequest(http.MethodGet, "/v1/models", "")
	require.Equal(t, http.StatusOK, listing.Code, listing.Body.String())
	require.Contains(t, listing.Body.String(), "gpt-4o")
	require.NotContains(t, listing.Body.String(), constant.ImageMaxModel)
	pricing := apiTokenRequest(http.MethodGet, "/api/pricing", "")
	require.Contains(t, pricing.Body.String(), "gpt-4o")
	require.NotContains(t, pricing.Body.String(), constant.ImageMaxModel)
	blocked := generate("text", "a flower", "2816x1584", "png", "auto", nil, true)
	require.Equal(t, http.StatusServiceUnavailable, blocked.Code, blocked.Body.String())
	require.Empty(t, forwarded)
	require.Equal(t, 475000, wallet())
	require.NoError(t, setting.UpdateUserUsableGroupsByJSONString(`{"default":"default","GPT-Image-V2":"images"}`))

	for _, test := range []struct {
		mode    string
		size    string
		image   []byte
		balance int
	}{
		{"text", "2816x1584", nil, 325000},
		{"image", "3840x2160", picture.Bytes(), 0},
	} {
		rr := generate(test.mode, "a flower", test.size, "png", "transparent", test.image, true)
		require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())
		require.Contains(t, rr.Body.String(), encoded)
		require.NotContains(t, rr.Body.String(), constant.ImageMaxModel)
		require.Len(t, forwarded, 1)
		sent := <-forwarded
		require.Equal(t, constant.ImageMaxModel, sent["model"])
		require.Equal(t, test.size, sent["size"])
		require.Equal(t, false, sent["watermark"])
		require.Equal(t, "b64_json", sent["response_format"])
		require.NotContains(t, sent, "layer_decomposition")
		if test.image != nil {
			require.Equal(t, "data:image/png;base64,"+encoded, sent["image"])
		} else {
			require.NotContains(t, sent, "image")
		}
		require.Equal(t, test.balance, wallet())
	}
	logs, count, err := model.GetUserLogs(account.Id, model.LogTypeConsume, 0, 0, "", "", 0, 10, "", "")
	require.NoError(t, err)
	require.EqualValues(t, 2, count)
	for i, log := range logs {
		require.Equal(t, constant.ImageMaxName, log.ModelName)
		require.Equal(t, "GPT-Image-V2", log.Group)
		require.Equal(t, []int{325000, 150000}[i], log.Quota)
		require.Contains(t, log.Other, `"billing_source":"wallet"`)
		require.NotContains(t, log.Other, constant.ImageMaxModel)
	}

	insufficient := generate("text", "a flower", "2816x1584", "png", "auto", nil, true)
	require.Equal(t, http.StatusForbidden, insufficient.Code, insufficient.Body.String())
	require.Contains(t, insufficient.Body.String(), "钱包余额不足")
	adjustAccount(150000, "subscription_only")
	subscriptionOnly := generate("text", "a flower", "2816x1584", "png", "auto", nil, true)
	require.Equal(t, http.StatusForbidden, subscriptionOnly.Code, subscriptionOnly.Body.String())
	require.Empty(t, forwarded)
	require.Equal(t, 150000, wallet())

	adjustAccount(150000, "subscription_first")
	failed := generate("text", "fail", "2816x1584", "png", "auto", nil, true)
	require.Equal(t, http.StatusBadGateway, failed.Code, failed.Body.String())
	require.NotContains(t, failed.Body.String(), constant.ImageMaxModel)
	require.Len(t, forwarded, 1, "do not retry an upstream generation automatically")
	require.Eventually(t, func() bool { return wallet() == 150000 }, time.Second, 10*time.Millisecond)
	require.NoError(t, model.DB.First(&sub, sub.Id).Error)
	require.Zero(t, sub.AmountUsed)
}
