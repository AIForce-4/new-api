package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/bytedance/gopkg/util/gopool"
)

const (
	providerWalletTickInterval = 1 * time.Minute
	quotaToUSD                 = 1.0 / 500_000
)

var (
	providerWalletOnce    sync.Once
	providerWalletRunning atomic.Bool
)

// StartProviderWalletCheckTask starts the background scheduler.
// It ticks every minute and checks each enabled wallet that is due for refresh.
func StartProviderWalletCheckTask() {
	providerWalletOnce.Do(func() {
		if !common.IsMasterNode {
			return
		}
		gopool.Go(func() {
			logger.LogInfo(context.Background(), "provider wallet check task started")
			ticker := time.NewTicker(providerWalletTickInterval)
			defer ticker.Stop()
			runProviderWalletCheckOnce()
			for range ticker.C {
				runProviderWalletCheckOnce()
			}
		})
	})
}

func runProviderWalletCheckOnce() {
	if !providerWalletRunning.CompareAndSwap(false, true) {
		return
	}
	defer providerWalletRunning.Store(false)

	ctx := context.Background()
	wallets, err := model.GetEnabledProviderWallets()
	if err != nil {
		logger.LogWarn(ctx, fmt.Sprintf("provider wallet check: failed to load wallets: %v", err))
		return
	}

	now := time.Now()
	for _, w := range wallets {
		if w.CheckIntervalMinutes <= 0 {
			continue
		}
		if w.LastCheckedAt != nil {
			nextCheck := w.LastCheckedAt.Add(time.Duration(w.CheckIntervalMinutes) * time.Minute)
			if now.Before(nextCheck) {
				continue
			}
		}
		// Run check in its own goroutine so one slow provider doesn't block others.
		wallet := w
		gopool.Go(func() {
			if err := CheckAndSaveProviderWallet(wallet); err != nil {
				logger.LogWarn(ctx, fmt.Sprintf("provider wallet check failed [%s]: %v", wallet.Name, err))
			}
		})
	}
}

// CheckAndSaveProviderWallet queries the provider's balance and persists the result.
func CheckAndSaveProviderWallet(wallet *model.ProviderWallet) error {
	password, err := wallet.GetPassword()
	if err != nil {
		return fmt.Errorf("decrypt password: %w", err)
	}

	var balance float64
	switch wallet.Type {
	case model.ProviderTypeNewAPI:
		var extra newAPIExtra
		if wallet.ExtraConfig != "" {
			_ = json.Unmarshal([]byte(wallet.ExtraConfig), &extra)
		}
		balance, err = checkNewAPI(wallet.BaseURL, wallet.Username, password, extra.APIToken, extra.UserID)
	case model.ProviderTypeNekoCode:
		balance, err = checkNekoCode(wallet.BaseURL, wallet.Username, password)
	case model.ProviderTypePincc:
		var extra pinccExtra
		if wallet.ExtraConfig != "" {
			_ = json.Unmarshal([]byte(wallet.ExtraConfig), &extra)
		}
		if extra.Email == "" {
			extra.Email = wallet.Username
		}
		if extra.Password == "" {
			extra.Password = password
		}
		balance, err = checkPincc(wallet.BaseURL, extra.Email, extra.Password)
	case model.ProviderTypeAICodeMirror:
		var extra aicodeMirrorExtra
		if wallet.ExtraConfig != "" {
			_ = json.Unmarshal([]byte(wallet.ExtraConfig), &extra)
		}
		if extra.Phone == "" {
			extra.Phone = wallet.Username
		}
		if extra.Password == "" {
			extra.Password = password
		}
		balance, err = checkAICodeMirror(wallet.BaseURL, extra.Phone, extra.Password)
	default:
		return fmt.Errorf("unknown provider type: %s", wallet.Type)
	}
	if err != nil {
		return err
	}

	wallet.UpdateBalance(balance)
	return model.SaveBalanceUpdate(wallet)
}

// ── Extra config structs ──────────────────────────────────────────────────────

type newAPIExtra struct {
	APIToken string `json:"api_token"`
	UserID   int    `json:"user_id"`
}

type pinccExtra struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type aicodeMirrorExtra struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

// ── Provider implementations ──────────────────────────────────────────────────

// checkNewAPIWithToken queries /api/user/self directly using an API token (no login needed).
func checkNewAPIWithToken(baseURL, token string, userID int) (float64, error) {
	client := &http.Client{Timeout: 15 * time.Second}
	req, _ := http.NewRequest(http.MethodGet, baseURL+"/api/user/self", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("User-Agent", "Mozilla/5.0")
	if userID > 0 {
		req.Header.Set("New-Api-User", fmt.Sprintf("%d", userID))
	}
	resp, err := client.Do(req)
	if err != nil {
		return 0, fmt.Errorf("token self request: %w", err)
	}
	body, _ := io.ReadAll(resp.Body)
	resp.Body.Close()

	var selfData struct {
		Success bool `json:"success"`
		Data    struct {
			ID    int     `json:"id"`
			Quota float64 `json:"quota"`
		} `json:"data"`
		Message string `json:"message"`
	}
	if err = json.Unmarshal(body, &selfData); err != nil {
		return 0, fmt.Errorf("token self decode: %w", err)
	}
	if !selfData.Success {
		return 0, fmt.Errorf("token self failed: %s", selfData.Message)
	}
	return selfData.Data.Quota * quotaToUSD, nil
}

// checkNewAPI handles the standard new-api protocol (格瓦斯, 星辰AI, etc.).
func checkNewAPI(baseURL, username, password, apiToken string, userID int) (float64, error) {
	baseURL = strings.TrimRight(baseURL, "/")

	// If an API token is provided, use it directly to query self (bypasses login/Turnstile)
	if apiToken != "" {
		return checkNewAPIWithToken(baseURL, apiToken, userID)
	}

	jar := newSimpleCookieJar()
	client := &http.Client{Timeout: 15 * time.Second, Jar: jar}

	// Login
	loginBody := fmt.Sprintf(`{"username":%q,"password":%q}`, username, password)
	resp, err := client.Post(baseURL+"/api/user/login", "application/json", strings.NewReader(loginBody))
	if err != nil {
		return 0, fmt.Errorf("login request: %w", err)
	}
	defer resp.Body.Close()
	var loginResp struct {
		Success bool `json:"success"`
		Data    struct {
			ID    int     `json:"id"`
			Quota float64 `json:"quota"`
		} `json:"data"`
		Message string `json:"message"`
	}
	if err = json.NewDecoder(resp.Body).Decode(&loginResp); err != nil {
		return 0, fmt.Errorf("login decode: %w", err)
	}
	if !loginResp.Success {
		return 0, fmt.Errorf("login failed: %s", loginResp.Message)
	}

	// Get self (with session cookie + user ID header) to get accurate quota
	req, _ := http.NewRequest(http.MethodGet, baseURL+"/api/user/self", nil)
	req.Header.Set("User-Agent", "Mozilla/5.0")
	req.Header.Set("New-Api-User", fmt.Sprintf("%d", loginResp.Data.ID))
	selfResp, err := client.Do(req)
	if err != nil {
		// fallback: use quota from login response
		return loginResp.Data.Quota * quotaToUSD, nil
	}
	defer selfResp.Body.Close()
	var selfData struct {
		Success bool `json:"success"`
		Data    struct {
			Quota float64 `json:"quota"`
		} `json:"data"`
	}
	if err = json.NewDecoder(selfResp.Body).Decode(&selfData); err != nil || !selfData.Success {
		// fallback to login quota
		return loginResp.Data.Quota * quotaToUSD, nil
	}
	return selfData.Data.Quota * quotaToUSD, nil
}

// checkNekoCode handles NekoCode which uses HMAC-SHA256 request signing.
func checkNekoCode(baseURL, username, password string) (float64, error) {
	jar := newSimpleCookieJar()
	client := &http.Client{Timeout: 15 * time.Second, Jar: jar}
	baseURL = strings.TrimRight(baseURL, "/")

	signHeaders := func(path string) http.Header {
		t := fmt.Sprintf("%d", time.Now().Unix())
		const letters = "abcdefghijklmnopqrstuvwxyz0123456789"
		b := make([]byte, 8)
		for i := range b {
			b[i] = letters[rand.Intn(len(letters))]
		}
		n := string(b)
		h := sha256.Sum256([]byte(t + n + path + "nekoneko"))
		sig := hex.EncodeToString(h[:])[:16]
		hdr := http.Header{}
		hdr.Set("X-Timestamp", t)
		hdr.Set("X-Nonce", n)
		hdr.Set("X-Sign", sig)
		hdr.Set("Content-Type", "application/json")
		hdr.Set("User-Agent", "Mozilla/5.0")
		return hdr
	}

	// Login
	loginPath := "/user/login"
	loginBody := fmt.Sprintf(`{"username":%q,"password":%q}`, username, password)
	req, _ := http.NewRequest(http.MethodPost, baseURL+"/api"+loginPath, strings.NewReader(loginBody))
	for k, vs := range signHeaders(loginPath) {
		req.Header[k] = vs
	}
	resp, err := client.Do(req)
	if err != nil {
		return 0, fmt.Errorf("nekocode login: %w", err)
	}
	defer resp.Body.Close()
	var loginResp struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
	}
	if err = json.NewDecoder(resp.Body).Decode(&loginResp); err != nil {
		return 0, fmt.Errorf("nekocode login decode: %w", err)
	}
	if !loginResp.Success {
		return 0, fmt.Errorf("nekocode login failed: %s", loginResp.Message)
	}

	// Self
	selfPath := "/user/self"
	req2, _ := http.NewRequest(http.MethodGet, baseURL+"/api"+selfPath, nil)
	for k, vs := range signHeaders(selfPath) {
		req2.Header[k] = vs
	}
	selfResp, err := client.Do(req2)
	if err != nil {
		return 0, fmt.Errorf("nekocode self: %w", err)
	}
	defer selfResp.Body.Close()
	var selfData struct {
		Data struct {
			Balance interface{} `json:"balance"`
		} `json:"data"`
	}
	if err = json.NewDecoder(selfResp.Body).Decode(&selfData); err != nil {
		return 0, fmt.Errorf("nekocode self decode: %w", err)
	}
	// balance can be a string or number
	var raw float64
	switch v := selfData.Data.Balance.(type) {
	case float64:
		raw = v
	case string:
		fmt.Sscanf(v, "%f", &raw)
	}
	if raw > 1000 {
		return raw * quotaToUSD, nil
	}
	return raw, nil
}

// checkPincc handles Pincc which uses JWT Bearer auth.
func checkPincc(baseURL, email, password string) (float64, error) {
	client := &http.Client{Timeout: 15 * time.Second}
	baseURL = strings.TrimRight(baseURL, "/")

	// Login
	loginBody := fmt.Sprintf(`{"email":%q,"password":%q}`, email, password)
	resp, err := client.Post(baseURL+"/api/v1/auth/login", "application/json", strings.NewReader(loginBody))
	if err != nil {
		return 0, fmt.Errorf("pincc login: %w", err)
	}
	defer resp.Body.Close()
	var loginResp struct {
		Code int `json:"code"`
		Data struct {
			AccessToken string `json:"access_token"`
		} `json:"data"`
		Message string `json:"message"`
	}
	if err = json.NewDecoder(resp.Body).Decode(&loginResp); err != nil {
		return 0, fmt.Errorf("pincc login decode: %w", err)
	}
	if loginResp.Code != 0 {
		return 0, fmt.Errorf("pincc login failed: %s", loginResp.Message)
	}

	// Me
	req, _ := http.NewRequest(http.MethodGet, baseURL+"/api/v1/auth/me", nil)
	req.Header.Set("Authorization", "Bearer "+loginResp.Data.AccessToken)
	req.Header.Set("User-Agent", "Mozilla/5.0")
	meResp, err := client.Do(req)
	if err != nil {
		return 0, fmt.Errorf("pincc me: %w", err)
	}
	defer meResp.Body.Close()
	var meData struct {
		Data struct {
			Balance interface{} `json:"balance"`
		} `json:"data"`
	}
	if err = json.NewDecoder(meResp.Body).Decode(&meData); err != nil {
		return 0, fmt.Errorf("pincc me decode: %w", err)
	}
	var bal float64
	switch v := meData.Data.Balance.(type) {
	case float64:
		bal = v
	case string:
		fmt.Sscanf(v, "%f", &bal)
	}
	return bal, nil
}

// checkAICodeMirror handles AICodeMirror which uses NextAuth cookie-based auth.
func checkAICodeMirror(baseURL, phone, password string) (float64, error) {
	jar := newSimpleCookieJar()
	client := &http.Client{
		Timeout: 15 * time.Second,
		Jar:     jar,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse // handle redirects manually
		},
	}
	baseURL = strings.TrimRight(baseURL, "/")
	ua := "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

	// Get CSRF token
	req, _ := http.NewRequest(http.MethodGet, baseURL+"/api/auth/csrf", nil)
	req.Header.Set("User-Agent", ua)
	resp, err := client.Do(req)
	if err != nil {
		return 0, fmt.Errorf("aicodemirror csrf: %w", err)
	}
	body, _ := io.ReadAll(resp.Body)
	resp.Body.Close()
	var csrfResp struct {
		CsrfToken string `json:"csrfToken"`
	}
	if err = json.Unmarshal(body, &csrfResp); err != nil {
		return 0, fmt.Errorf("aicodemirror csrf decode: %w", err)
	}

	// Login via NextAuth credentials
	form := url.Values{
		"csrfToken":   {csrfResp.CsrfToken},
		"identifier":  {phone},
		"password":    {password},
		"redirect":    {"false"},
		"callbackUrl": {baseURL},
		"json":        {"true"},
	}
	req2, _ := http.NewRequest(http.MethodPost, baseURL+"/api/auth/callback/credentials",
		strings.NewReader(form.Encode()))
	req2.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req2.Header.Set("User-Agent", ua)
	req2.Header.Set("Origin", baseURL)
	req2.Header.Set("Referer", baseURL+"/login")
	resp2, err := client.Do(req2)
	if err != nil {
		return 0, fmt.Errorf("aicodemirror login: %w", err)
	}
	io.Copy(io.Discard, resp2.Body)
	resp2.Body.Close()

	// Query wallet
	req3, _ := http.NewRequest(http.MethodGet, baseURL+"/api/wallet", nil)
	req3.Header.Set("User-Agent", ua)
	resp3, err := client.Do(req3)
	if err != nil {
		return 0, fmt.Errorf("aicodemirror wallet: %w", err)
	}
	defer resp3.Body.Close()
	var walletResp struct {
		Data struct {
			Balance      interface{} `json:"balance"`
			BonusBalance interface{} `json:"bonusBalance"`
		} `json:"data"`
	}
	if err = json.NewDecoder(resp3.Body).Decode(&walletResp); err != nil {
		return 0, fmt.Errorf("aicodemirror wallet decode: %w", err)
	}
	toFloat := func(v interface{}) float64 {
		switch x := v.(type) {
		case float64:
			return x
		case string:
			var f float64
			fmt.Sscanf(x, "%f", &f)
			return f
		}
		return 0
	}
	// balance unit: 分 (1/1000 CNY)
	total := (toFloat(walletResp.Data.Balance) + toFloat(walletResp.Data.BonusBalance)) / 1000.0
	return total, nil
}

// ── simpleCookieJar ───────────────────────────────────────────────────────────

// simpleCookieJar is a minimal in-memory cookie jar.
type simpleCookieJar struct {
	mu      sync.Mutex
	cookies map[string][]*http.Cookie
}

func newSimpleCookieJar() *simpleCookieJar {
	return &simpleCookieJar{cookies: make(map[string][]*http.Cookie)}
}

func (j *simpleCookieJar) SetCookies(u *url.URL, cookies []*http.Cookie) {
	j.mu.Lock()
	defer j.mu.Unlock()
	key := u.Host
	existing := j.cookies[key]
	for _, nc := range cookies {
		replaced := false
		for i, ec := range existing {
			if ec.Name == nc.Name {
				existing[i] = nc
				replaced = true
				break
			}
		}
		if !replaced {
			existing = append(existing, nc)
		}
	}
	j.cookies[key] = existing
}

func (j *simpleCookieJar) Cookies(u *url.URL) []*http.Cookie {
	j.mu.Lock()
	defer j.mu.Unlock()
	return j.cookies[u.Host]
}
