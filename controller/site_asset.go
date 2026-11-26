package controller

import (
	"bytes"
	"crypto/sha256"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"

	"github.com/gin-gonic/gin"
	_ "golang.org/x/image/webp"
)

const (
	maxHomeNoticeImageSize       = 2 << 20
	minHomeNoticeImageDimension  = 64
	maxHomeNoticeImageDimension  = 4096
	homeNoticeAssetRoutePrefix   = "/api/site_asset/"
	homeNoticeAssetDirectoryName = "site-assets"

	homeNoticeImagePrefix         = "home-notice"
	groupPromoCustomerImagePrefix = "group-promo-customer"
	groupPromoGroupImagePrefix    = "group-promo-group"
)

type groupPromoImageDefinition struct {
	Type                 string
	LabelOptionKey       string
	DescriptionOptionKey string
	ImageURLKey          string
	AssetPrefix          string
	DefaultLabel         string
	DefaultDescription   string
}

type GroupPromoImageSetting struct {
	Type        string `json:"type"`
	Label       string `json:"label"`
	Description string `json:"description"`
	URL         string `json:"url"`
}

type GroupPromoSettings struct {
	Badge   string                   `json:"badge"`
	Title   string                   `json:"title"`
	Content string                   `json:"content"`
	Images  []GroupPromoImageSetting `json:"images"`
}

var groupPromoImageDefinitions = []groupPromoImageDefinition{
	{
		Type:                 "customer_service",
		LabelOptionKey:       "GroupPromoCustomerQRCodeTitle",
		DescriptionOptionKey: "GroupPromoCustomerQRCodeDescription",
		ImageURLKey:          "GroupPromoCustomerQRCodeImageURL",
		AssetPrefix:          groupPromoCustomerImagePrefix,
		DefaultLabel:         "平台客服",
		DefaultDescription:   "扫码添加客服，获取提现协助与使用支持",
	},
	{
		Type:                 "group",
		LabelOptionKey:       "GroupPromoGroupQRCodeTitle",
		DescriptionOptionKey: "GroupPromoGroupQRCodeDescription",
		ImageURLKey:          "GroupPromoGroupQRCodeImageURL",
		AssetPrefix:          groupPromoGroupImagePrefix,
		DefaultLabel:         "用户群",
		DefaultDescription:   "扫码加入用户群，接收交流答疑与活动通知",
	},
}

var siteAssetNamePattern = regexp.MustCompile(
	`^(home-notice|group-promo-customer|group-promo-group)-[a-f0-9]{16}\.(png|jpg|webp)$`,
)

func homeNoticeAssetDir() string {
	if configuredDir := strings.TrimSpace(os.Getenv("SITE_ASSET_DIR")); configuredDir != "" {
		return configuredDir
	}
	return filepath.Join("data", homeNoticeAssetDirectoryName)
}

func validateHomeNoticeImage(data []byte) (string, error) {
	config, format, err := image.DecodeConfig(bytes.NewReader(data))
	if err != nil {
		return "", fmt.Errorf("无法识别图片格式，请上传 PNG、JPG 或 WebP 图片")
	}
	if config.Width < minHomeNoticeImageDimension ||
		config.Height < minHomeNoticeImageDimension {
		return "", fmt.Errorf(
			"图片尺寸不能小于 %d×%d",
			minHomeNoticeImageDimension,
			minHomeNoticeImageDimension,
		)
	}
	if config.Width > maxHomeNoticeImageDimension ||
		config.Height > maxHomeNoticeImageDimension {
		return "", fmt.Errorf(
			"图片尺寸不能超过 %d×%d",
			maxHomeNoticeImageDimension,
			maxHomeNoticeImageDimension,
		)
	}

	switch format {
	case "png":
		return "png", nil
	case "jpeg":
		return "jpg", nil
	case "webp":
		return "webp", nil
	default:
		return "", fmt.Errorf("仅支持 PNG、JPG 或 WebP 图片")
	}
}

func readSiteImage(fileHeader *multipart.FileHeader) ([]byte, error) {
	if fileHeader.Size <= 0 || fileHeader.Size > maxHomeNoticeImageSize {
		return nil, fmt.Errorf("图片大小不能超过 2 MB")
	}

	file, err := fileHeader.Open()
	if err != nil {
		return nil, err
	}
	defer file.Close()

	data, err := io.ReadAll(io.LimitReader(file, maxHomeNoticeImageSize+1))
	if err != nil {
		return nil, err
	}
	if len(data) > maxHomeNoticeImageSize {
		return nil, fmt.Errorf("图片大小不能超过 2 MB")
	}
	return data, nil
}

func saveSiteImage(data []byte, prefix string) (string, string, error) {
	extension, err := validateHomeNoticeImage(data)
	if err != nil {
		return "", "", err
	}

	hash := sha256.Sum256(data)
	filename := fmt.Sprintf("%s-%x.%s", prefix, hash[:8], extension)
	assetDir := homeNoticeAssetDir()
	if err := os.MkdirAll(assetDir, 0750); err != nil {
		return "", "", err
	}
	if err := os.WriteFile(filepath.Join(assetDir, filename), data, 0644); err != nil {
		return "", "", err
	}
	return filename, homeNoticeAssetRoutePrefix + filename, nil
}

func deleteManagedSiteAsset(url string, expectedPrefix string) error {
	if !strings.HasPrefix(url, homeNoticeAssetRoutePrefix) {
		return nil
	}
	filename := strings.TrimPrefix(url, homeNoticeAssetRoutePrefix)
	if !siteAssetNamePattern.MatchString(filename) {
		return nil
	}
	if expectedPrefix != "" && !strings.HasPrefix(filename, expectedPrefix+"-") {
		return nil
	}

	err := os.Remove(filepath.Join(homeNoticeAssetDir(), filename))
	if err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

func UploadHomeNoticeImage(c *gin.Context) {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "请选择要上传的图片",
		})
		return
	}

	data, err := readSiteImage(fileHeader)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	_, url, err := saveSiteImage(data, homeNoticeImagePrefix)
	if err != nil {
		if strings.Contains(err.Error(), "图片") {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}
		common.ApiError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"url": url,
		},
	})
}

func buildGroupPromoSettingsLocked() GroupPromoSettings {
	images := make([]GroupPromoImageSetting, 0, len(groupPromoImageDefinitions))
	for _, definition := range groupPromoImageDefinitions {
		label := common.OptionMap[definition.LabelOptionKey]
		if label == "" {
			label = definition.DefaultLabel
		}
		description := common.OptionMap[definition.DescriptionOptionKey]
		if description == "" {
			description = definition.DefaultDescription
		}
		images = append(images, GroupPromoImageSetting{
			Type:        definition.Type,
			Label:       label,
			Description: description,
			URL:         common.OptionMap[definition.ImageURLKey],
		})
	}
	return GroupPromoSettings{
		Badge:   common.OptionMap["GroupPromoBadge"],
		Title:   common.OptionMap["GroupPromoTitle"],
		Content: common.OptionMap["GroupPromoContent"],
		Images:  images,
	}
}

func GetGroupPromoSettings(c *gin.Context) {
	common.OptionMapRWMutex.RLock()
	settings := buildGroupPromoSettingsLocked()
	common.OptionMapRWMutex.RUnlock()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    settings,
	})
}

func UpdateGroupPromoSettings(c *gin.Context) {
	var settings GroupPromoSettings
	if err := common.DecodeJson(c.Request.Body, &settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的参数",
		})
		return
	}

	settings.Badge = strings.TrimSpace(settings.Badge)
	settings.Title = strings.TrimSpace(settings.Title)
	settings.Content = strings.TrimSpace(settings.Content)
	if settings.Badge == "" || settings.Title == "" || settings.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "公告标签、标题和正文不能为空",
		})
		return
	}
	if len(settings.Badge) > 30 || len(settings.Title) > 80 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "公告标签或标题过长",
		})
		return
	}
	if len(settings.Content) > 2000 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "公告正文不能超过 2000 个字符",
		})
		return
	}

	imageCopyKeys := map[string][2]string{
		"customer_service": {
			"GroupPromoCustomerQRCodeTitle",
			"GroupPromoCustomerQRCodeDescription",
		},
		"group": {
			"GroupPromoGroupQRCodeTitle",
			"GroupPromoGroupQRCodeDescription",
		},
	}
	imageCopyUpdates := make(map[string]string)
	for _, image := range settings.Images {
		keys, ok := imageCopyKeys[image.Type]
		if !ok {
			continue
		}
		label := strings.TrimSpace(image.Label)
		description := strings.TrimSpace(image.Description)
		if label == "" || description == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "二维码标题和说明不能为空",
			})
			return
		}
		if len(label) > 30 || len(description) > 120 {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "二维码标题或说明过长",
			})
			return
		}
		imageCopyUpdates[keys[0]] = label
		imageCopyUpdates[keys[1]] = description
	}
	if len(imageCopyUpdates) != 4 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "群公告必须包含客服二维码和用户群二维码",
		})
		return
	}

	updates := []struct {
		key   string
		value string
	}{
		{key: "GroupPromoBadge", value: settings.Badge},
		{key: "GroupPromoTitle", value: settings.Title},
		{key: "GroupPromoContent", value: settings.Content},
		{key: "GroupPromoCustomerQRCodeTitle", value: imageCopyUpdates["GroupPromoCustomerQRCodeTitle"]},
		{key: "GroupPromoCustomerQRCodeDescription", value: imageCopyUpdates["GroupPromoCustomerQRCodeDescription"]},
		{key: "GroupPromoGroupQRCodeTitle", value: imageCopyUpdates["GroupPromoGroupQRCodeTitle"]},
		{key: "GroupPromoGroupQRCodeDescription", value: imageCopyUpdates["GroupPromoGroupQRCodeDescription"]},
	}
	for _, update := range updates {
		if err := model.UpdateOption(update.key, update.value); err != nil {
			common.ApiError(c, err)
			return
		}
	}

	common.OptionMapRWMutex.RLock()
	response := buildGroupPromoSettingsLocked()
	common.OptionMapRWMutex.RUnlock()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    response,
	})
}

func UploadGroupPromoImage(c *gin.Context) {
	imageType := strings.TrimSpace(c.PostForm("type"))
	var definition *groupPromoImageDefinition
	for index := range groupPromoImageDefinitions {
		if groupPromoImageDefinitions[index].Type == imageType {
			definition = &groupPromoImageDefinitions[index]
			break
		}
	}
	if definition == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "不支持的群公告图片类型",
		})
		return
	}

	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "请选择要上传的图片",
		})
		return
	}
	data, err := readSiteImage(fileHeader)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	filename, url, err := saveSiteImage(data, definition.AssetPrefix)
	if err != nil {
		if strings.Contains(err.Error(), "图片") {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}
		common.ApiError(c, err)
		return
	}

	common.OptionMapRWMutex.RLock()
	oldURL := common.OptionMap[definition.ImageURLKey]
	common.OptionMapRWMutex.RUnlock()

	if err := model.UpdateOption(definition.ImageURLKey, url); err != nil {
		_ = deleteManagedSiteAsset(
			homeNoticeAssetRoutePrefix+filename,
			definition.AssetPrefix,
		)
		common.ApiError(c, err)
		return
	}
	if oldURL != url {
		if err := deleteManagedSiteAsset(oldURL, definition.AssetPrefix); err != nil {
			common.SysError("failed to delete replaced group promo image: " + err.Error())
		}
	}

	common.OptionMapRWMutex.RLock()
	label := common.OptionMap[definition.LabelOptionKey]
	description := common.OptionMap[definition.DescriptionOptionKey]
	common.OptionMapRWMutex.RUnlock()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": GroupPromoImageSetting{
			Type:        definition.Type,
			Label:       label,
			Description: description,
			URL:         url,
		},
	})
}

func GetHomeNoticeImage(c *gin.Context) {
	filename := c.Param("filename")
	if !siteAssetNamePattern.MatchString(filename) {
		c.Status(http.StatusNotFound)
		return
	}

	assetPath := filepath.Join(homeNoticeAssetDir(), filename)
	fileInfo, err := os.Stat(assetPath)
	if err != nil || !fileInfo.Mode().IsRegular() {
		c.Status(http.StatusNotFound)
		return
	}

	c.Header("Cache-Control", "public, max-age=31536000, immutable")
	c.Header("X-Content-Type-Options", "nosniff")
	c.File(assetPath)
}
