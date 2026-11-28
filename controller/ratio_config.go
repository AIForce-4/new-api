package controller

import (
	"net/http"

	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/setting/ratio_setting"

	"github.com/gin-gonic/gin"
)

func GetRatioConfig(c *gin.Context) {
	if !ratio_setting.IsExposeRatioEnabled() {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "倍率配置接口未启用",
		})
		return
	}

	data := ratio_setting.GetExposedData()
	for key, entry := range data {
		if ratios, ok := entry.(map[string]float64); ok {
			visible := make(map[string]float64, len(ratios))
			for name, ratio := range ratios {
				if !constant.IsImageMaxModel(name) {
					visible[name] = ratio
				}
			}
			data[key] = visible
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    data,
	})
}
