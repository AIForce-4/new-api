package controller

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"image"
	"io"
	"mime/multipart"
	"net/http"
	"slices"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"
)

const imageMaxReferenceBytes = 12 << 20 // shortcut: one reference up to 12 MiB, increase with the upload proxy limit if needed.

func imageMaxOptions(mode, prompt, size, format, background string, files []*multipart.FileHeader) (map[string]any, error) {
	prompt = strings.TrimSpace(prompt)
	if prompt == "" || len(prompt) > 16000 {
		return nil, fmt.Errorf("请输入提示词，最多 16000 字节")
	}
	w, h, _ := strings.Cut(size, "x")
	width, widthErr := strconv.Atoi(w)
	height, heightErr := strconv.Atoi(h)
	if widthErr != nil || heightErr != nil || width <= 0 || height <= 0 || width > 12000 || height > 12000 ||
		width*height < 921600 || width*height > 8294400 || width > 16*height || height > 16*width {
		return nil, fmt.Errorf("生图Max不支持这个尺寸")
	}
	if format != "png" && format != "jpeg" {
		return nil, fmt.Errorf("输出格式只能是 PNG 或 JPEG")
	}
	if background != "auto" && background != "opaque" && background != "transparent" {
		return nil, fmt.Errorf("不支持该背景选项")
	}
	if background == "transparent" && format != "png" {
		return nil, fmt.Errorf("透明背景只支持 PNG")
	}
	body := map[string]any{
		"model": constant.ImageMaxModel, "prompt": prompt,
		"size": fmt.Sprintf("%dx%d", width, height), "output_format": format,
		"background": background, "response_format": "b64_json", "watermark": false,
	}
	switch mode {
	case "text":
		if len(files) != 0 {
			return nil, fmt.Errorf("文生图不能上传参考图")
		}
	case "image":
		if len(files) != 1 {
			return nil, fmt.Errorf("图生图需要上传一张参考图")
		}
		reference, err := imageMaxReference(files[0])
		if err != nil {
			return nil, err
		}
		body["image"] = reference
	default:
		return nil, fmt.Errorf("请选择文生图或图生图")
	}
	return body, nil
}

func imageMaxReference(file *multipart.FileHeader) (string, error) {
	if file.Size <= 0 || file.Size > imageMaxReferenceBytes {
		return "", fmt.Errorf("参考图不能超过 12 MB")
	}
	input, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("无法读取参考图")
	}
	defer input.Close()
	data, err := io.ReadAll(io.LimitReader(input, imageMaxReferenceBytes+1))
	if err != nil || len(data) > imageMaxReferenceBytes {
		return "", fmt.Errorf("无法读取参考图，或图片超过 12 MB")
	}
	config, format, err := image.DecodeConfig(bytes.NewReader(data))
	if err != nil || (format != "png" && format != "jpeg" && format != "webp") {
		return "", fmt.Errorf("参考图只支持 PNG、JPEG 或 WebP")
	}
	w, h := int64(config.Width), int64(config.Height)
	if w <= 14 || h <= 14 || w > 36_000_000 || h > 36_000_000 || w*h > 36_000_000 || w > 16*h || h > 16*w {
		return "", fmt.Errorf("参考图尺寸不受支持")
	}
	return "data:image/" + format + ";base64," + base64.StdEncoding.EncodeToString(data), nil
}

func imageMaxFailure(c *gin.Context, status int, message string) {
	c.AbortWithStatusJSON(status, gin.H{"error": gin.H{"message": message}})
}

func imageMaxGroup(userGroup string) (string, error) {
	groups, err := model.GetImageMaxGroups()
	if err != nil || slices.Contains(groups, userGroup) {
		return userGroup, err
	}
	usable := service.GetUserUsableGroups(userGroup)
	var selected string
	for _, group := range groups {
		if _, ok := usable[group]; !ok || !ratio_setting.ContainsGroupRatio(group) {
			continue
		}
		// shortcut: require a unique fallback instead of choosing between different group prices.
		if selected != "" {
			return "", nil
		}
		selected = group
	}
	return selected, nil
}

func PrepareImageMax(c *gin.Context) {
	if c.GetBool("use_access_token") {
		imageMaxFailure(c, http.StatusForbidden, "生图Max仅支持登录后使用")
		return
	}
	user, err := model.GetUserCache(c.GetInt("id"))
	if err != nil || user.Status != common.UserStatusEnabled {
		imageMaxFailure(c, http.StatusForbidden, "当前账号不可用")
		return
	}
	user.WriteContext(c)

	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, imageMaxReferenceBytes+(64<<10))
	if err := c.Request.ParseMultipartForm(1 << 20); err != nil {
		if common.IsRequestBodyTooLargeError(err) {
			imageMaxFailure(c, http.StatusRequestEntityTooLarge, "参考图不能超过 12 MB")
		} else {
			imageMaxFailure(c, http.StatusBadRequest, "无效的生图Max请求")
		}
		return
	}
	form := c.Request.MultipartForm
	defer form.RemoveAll()
	get := func(key string) string {
		if values := form.Value[key]; len(values) > 0 {
			return values[0]
		}
		return ""
	}
	request, err := imageMaxOptions(get("mode"), get("prompt"), get("size"), get("output_format"), get("background"), form.File["image"])
	if err != nil {
		imageMaxFailure(c, http.StatusBadRequest, err.Error())
		return
	}
	group, err := imageMaxGroup(user.Group)
	if err != nil || group == "" {
		imageMaxFailure(c, http.StatusServiceUnavailable, "当前账号暂无可用的生图Max渠道分组")
		return
	}
	common.SetContextKey(c, constant.ContextKeyUsingGroup, group)
	common.SetContextKey(c, constant.ContextKeyTokenGroup, group)
	body, err := common.Marshal(request)
	if err != nil {
		imageMaxFailure(c, http.StatusInternalServerError, "无法准备生图请求")
		return
	}
	// Downstream routing, pricing and forwarding must see the same validated size.
	common.CleanupBodyStorage(c)
	c.Set(common.KeyRequestBody, nil)
	c.Request.Body = io.NopCloser(bytes.NewReader(body))
	c.Request.ContentLength = int64(len(body))
	c.Request.Header.Set("Content-Type", gin.MIMEJSON)
}

func ImageMax(c *gin.Context) {
	Relay(c, types.RelayFormatOpenAIImage)
}
