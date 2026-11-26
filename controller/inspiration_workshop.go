package controller

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"

	"github.com/gin-gonic/gin"
)

const (
	defaultInspirationWorkshopImageModel = "gpt-image-2"
	maxInspirationWorkshopModels         = 50
	maxInspirationWorkshopModelIDLength  = 128
)

var defaultInspirationWorkshopImageModels = []string{
	"gpt-image-2",
	"gpt-image-1",
}

type InspirationWorkshopSettings struct {
	ImageModels       []string `json:"image_models"`
	DefaultImageModel string   `json:"default_image_model"`
}

func fallbackInspirationWorkshopSettings() InspirationWorkshopSettings {
	return InspirationWorkshopSettings{
		ImageModels:       append([]string(nil), defaultInspirationWorkshopImageModels...),
		DefaultImageModel: defaultInspirationWorkshopImageModel,
	}
}

func normalizeInspirationWorkshopSettings(
	settings InspirationWorkshopSettings,
) (InspirationWorkshopSettings, error) {
	normalized := InspirationWorkshopSettings{
		ImageModels: make([]string, 0, len(settings.ImageModels)),
	}
	seen := make(map[string]struct{}, len(settings.ImageModels))
	for _, rawModel := range settings.ImageModels {
		modelID := strings.TrimSpace(rawModel)
		if modelID == "" {
			continue
		}
		if len(modelID) > maxInspirationWorkshopModelIDLength {
			return InspirationWorkshopSettings{}, fmt.Errorf(
				"模型 ID 长度不能超过 %d 个字符",
				maxInspirationWorkshopModelIDLength,
			)
		}
		if _, exists := seen[modelID]; exists {
			continue
		}
		seen[modelID] = struct{}{}
		normalized.ImageModels = append(normalized.ImageModels, modelID)
	}
	if len(normalized.ImageModels) == 0 {
		return InspirationWorkshopSettings{}, fmt.Errorf("至少配置一个图片模型")
	}
	if len(normalized.ImageModels) > maxInspirationWorkshopModels {
		return InspirationWorkshopSettings{}, fmt.Errorf(
			"图片模型数量不能超过 %d 个",
			maxInspirationWorkshopModels,
		)
	}

	defaultModel := strings.TrimSpace(settings.DefaultImageModel)
	if defaultModel == "" {
		defaultModel = normalized.ImageModels[0]
	} else if _, exists := seen[defaultModel]; !exists {
		return InspirationWorkshopSettings{}, fmt.Errorf("默认模型必须包含在图片模型列表中")
	}
	normalized.DefaultImageModel = defaultModel

	return normalized, nil
}

func readInspirationWorkshopSettingsLocked() InspirationWorkshopSettings {
	settings := fallbackInspirationWorkshopSettings()
	rawModels := strings.TrimSpace(
		common.OptionMap["InspirationWorkshopImageModels"],
	)
	if rawModels != "" {
		var imageModels []string
		if err := common.UnmarshalJsonStr(rawModels, &imageModels); err == nil {
			settings.ImageModels = imageModels
		}
	}
	if configuredDefault := strings.TrimSpace(
		common.OptionMap["InspirationWorkshopDefaultImageModel"],
	); configuredDefault != "" {
		settings.DefaultImageModel = configuredDefault
	}
	if normalized, err := normalizeInspirationWorkshopSettings(settings); err == nil {
		return normalized
	}
	return fallbackInspirationWorkshopSettings()
}

func GetInspirationWorkshopSettings(c *gin.Context) {
	common.OptionMapRWMutex.RLock()
	settings := readInspirationWorkshopSettingsLocked()
	common.OptionMapRWMutex.RUnlock()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    settings,
	})
}

func UpdateInspirationWorkshopSettings(c *gin.Context) {
	var settings InspirationWorkshopSettings
	if err := common.DecodeJson(c.Request.Body, &settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的参数",
		})
		return
	}

	normalized, err := normalizeInspirationWorkshopSettings(settings)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	modelsJSON, err := common.Marshal(normalized.ImageModels)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	updates := []struct {
		key   string
		value string
	}{
		{
			key:   "InspirationWorkshopImageModels",
			value: string(modelsJSON),
		},
		{
			key:   "InspirationWorkshopDefaultImageModel",
			value: normalized.DefaultImageModel,
		},
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
		"data":    normalized,
	})
}
