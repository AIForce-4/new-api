package controller

import (
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"

	"github.com/gin-gonic/gin"
)

const (
	defaultHomeNoticeQRCodeCaption = "微信扫码添加客服"
	maxHomeNoticeContentLength     = 50000
	maxHomeNoticeQRCodeURLLength   = 2048
	maxHomeNoticeCaptionLength     = 100
)

type HomeNoticeSettings struct {
	Enabled        bool   `json:"enabled"`
	Content        string `json:"content"`
	QRCodeImageURL string `json:"qr_code_image_url"`
	QRCodeCaption  string `json:"qr_code_caption"`
}

func readHomeNoticeSettingsLocked() HomeNoticeSettings {
	enabled, err := strconv.ParseBool(common.OptionMap["HomeNoticeEnabled"])
	if err != nil {
		enabled = true
	}

	caption := common.OptionMap["HomeNoticeQRCodeCaption"]
	if caption == "" {
		caption = defaultHomeNoticeQRCodeCaption
	}

	return HomeNoticeSettings{
		Enabled:        enabled,
		Content:        common.OptionMap["Notice"],
		QRCodeImageURL: common.OptionMap["HomeNoticeQRCodeImageURL"],
		QRCodeCaption:  caption,
	}
}

func buildHomeNoticeSettingsLocked() HomeNoticeSettings {
	settings := readHomeNoticeSettingsLocked()
	settings.Content = strings.TrimSpace(settings.Content)
	settings.QRCodeImageURL = strings.TrimSpace(settings.QRCodeImageURL)
	settings.QRCodeCaption = strings.TrimSpace(settings.QRCodeCaption)
	return settings
}

func GetHomeNoticeSettings(c *gin.Context) {
	common.OptionMapRWMutex.RLock()
	settings := buildHomeNoticeSettingsLocked()
	common.OptionMapRWMutex.RUnlock()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    settings,
	})
}

func validateHomeNoticeSettings(settings HomeNoticeSettings) error {
	if len(settings.Content) > maxHomeNoticeContentLength {
		return fmt.Errorf("公告内容长度不能超过 %d 个字符", maxHomeNoticeContentLength)
	}
	if len(settings.QRCodeImageURL) > maxHomeNoticeQRCodeURLLength {
		return fmt.Errorf("二维码图片地址长度不能超过 %d 个字符", maxHomeNoticeQRCodeURLLength)
	}
	if len(settings.QRCodeCaption) > maxHomeNoticeCaptionLength {
		return fmt.Errorf("二维码说明长度不能超过 %d 个字符", maxHomeNoticeCaptionLength)
	}
	if settings.Enabled && settings.Content == "" && settings.QRCodeImageURL == "" {
		return fmt.Errorf("启用官网弹窗时，公告内容或二维码至少填写一项")
	}
	if settings.QRCodeImageURL == "" {
		return nil
	}

	if strings.HasPrefix(settings.QRCodeImageURL, "/") {
		if strings.HasPrefix(settings.QRCodeImageURL, "//") {
			return fmt.Errorf("二维码图片地址格式不正确")
		}
		return nil
	}

	parsedURL, err := url.Parse(settings.QRCodeImageURL)
	if err != nil ||
		(parsedURL.Scheme != "http" && parsedURL.Scheme != "https") ||
		parsedURL.Hostname() == "" ||
		parsedURL.User != nil {
		return fmt.Errorf("二维码图片地址必须使用 http/https 链接或站内路径")
	}

	return nil
}

func UpdateHomeNoticeSettings(c *gin.Context) {
	var settings HomeNoticeSettings
	if err := common.DecodeJson(c.Request.Body, &settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的参数",
		})
		return
	}

	settings.Content = strings.TrimSpace(settings.Content)
	settings.QRCodeImageURL = strings.TrimSpace(settings.QRCodeImageURL)
	settings.QRCodeCaption = strings.TrimSpace(settings.QRCodeCaption)
	if settings.QRCodeCaption == "" {
		settings.QRCodeCaption = defaultHomeNoticeQRCodeCaption
	}

	if err := validateHomeNoticeSettings(settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	updates := []struct {
		key   string
		value string
	}{
		{key: "Notice", value: settings.Content},
		{key: "HomeNoticeEnabled", value: strconv.FormatBool(settings.Enabled)},
		{key: "HomeNoticeQRCodeImageURL", value: settings.QRCodeImageURL},
		{key: "HomeNoticeQRCodeCaption", value: settings.QRCodeCaption},
	}
	for _, update := range updates {
		if err := model.UpdateOption(update.key, update.value); err != nil {
			common.ApiError(c, err)
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    settings,
	})
}
