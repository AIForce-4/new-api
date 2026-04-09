package controller

import (
	"net/http"
	"strconv"

	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
	"github.com/gin-gonic/gin"
)

// ProviderWalletResponse is the public-facing struct (no encrypted password).
type ProviderWalletResponse struct {
	*model.ProviderWallet
	TodaySpend float64 `json:"today_spend"`
}

func toProviderWalletResponse(w *model.ProviderWallet) ProviderWalletResponse {
	return ProviderWalletResponse{
		ProviderWallet: w,
		TodaySpend:     w.TodaySpend(),
	}
}

// GetAllProviderWallets godoc
// GET /api/provider_wallet/
func GetAllProviderWallets(c *gin.Context) {
	wallets, err := model.GetAllProviderWallets()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	resp := make([]ProviderWalletResponse, 0, len(wallets))
	for _, w := range wallets {
		resp = append(resp, toProviderWalletResponse(w))
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "", "data": resp})
}

// CreateProviderWallet godoc
// POST /api/provider_wallet/
func CreateProviderWallet(c *gin.Context) {
	var req struct {
		Name                 string              `json:"name" binding:"required"`
		Type                 model.ProviderType  `json:"type" binding:"required"`
		BaseURL              string              `json:"base_url" binding:"required"`
		Username             string              `json:"username"`
		Password             string              `json:"password"`
		ExtraConfig          string              `json:"extra_config"`
		CheckIntervalMinutes int                 `json:"check_interval_minutes"`
		BalanceCurrency      model.BalanceCurrency `json:"balance_currency"`
		Enabled              *bool               `json:"enabled"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	wallet := &model.ProviderWallet{
		Name:                 req.Name,
		Type:                 req.Type,
		BaseURL:              req.BaseURL,
		Username:             req.Username,
		ExtraConfig:          req.ExtraConfig,
		CheckIntervalMinutes: req.CheckIntervalMinutes,
		BalanceCurrency:      req.BalanceCurrency,
		Enabled:              true,
	}
	if req.Enabled != nil {
		wallet.Enabled = *req.Enabled
	}
	if req.BalanceCurrency == "" {
		wallet.BalanceCurrency = model.BalanceCurrencyUSD
	}
	if err := wallet.SetPassword(req.Password); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "密码加密失败: " + err.Error()})
		return
	}
	if err := model.CreateProviderWallet(wallet); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "", "data": toProviderWalletResponse(wallet)})
}

// UpdateProviderWallet godoc
// PUT /api/provider_wallet/:id
func UpdateProviderWallet(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的ID"})
		return
	}

	wallet, err := model.GetProviderWalletByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "供应商不存在"})
		return
	}

	var req struct {
		Name                 string                `json:"name"`
		Type                 model.ProviderType    `json:"type"`
		BaseURL              string                `json:"base_url"`
		Username             string                `json:"username"`
		Password             string                `json:"password"`
		ExtraConfig          string                `json:"extra_config"`
		CheckIntervalMinutes int                   `json:"check_interval_minutes"`
		BalanceCurrency      model.BalanceCurrency `json:"balance_currency"`
		Enabled              *bool                 `json:"enabled"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	if req.Name != "" {
		wallet.Name = req.Name
	}
	if req.Type != "" {
		wallet.Type = req.Type
	}
	if req.BaseURL != "" {
		wallet.BaseURL = req.BaseURL
	}
	if req.Username != "" {
		wallet.Username = req.Username
	}
	if req.ExtraConfig != "" {
		wallet.ExtraConfig = req.ExtraConfig
	}
	if req.CheckIntervalMinutes > 0 {
		wallet.CheckIntervalMinutes = req.CheckIntervalMinutes
	}
	if req.BalanceCurrency != "" {
		wallet.BalanceCurrency = req.BalanceCurrency
	}
	if req.Enabled != nil {
		wallet.Enabled = *req.Enabled
	}
	// Only update password if a new one is provided.
	if req.Password != "" {
		if err := wallet.SetPassword(req.Password); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "密码加密失败: " + err.Error()})
			return
		}
	}

	if err := model.UpdateProviderWallet(wallet); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "", "data": toProviderWalletResponse(wallet)})
}

// DeleteProviderWallet godoc
// DELETE /api/provider_wallet/:id
func DeleteProviderWallet(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的ID"})
		return
	}
	if err := model.DeleteProviderWallet(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "删除成功"})
}

// CheckProviderWallet manually triggers a balance refresh for a single provider.
// POST /api/provider_wallet/:id/check
func CheckProviderWallet(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的ID"})
		return
	}
	wallet, err := model.GetProviderWalletByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "供应商不存在"})
		return
	}
	if err := service.CheckAndSaveProviderWallet(wallet); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "查询失败: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "", "data": toProviderWalletResponse(wallet)})
}
