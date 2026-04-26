package controller

import (
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

type InviteRebateWithdrawRequest struct {
	Username string `json:"username"`
	Quota    int    `json:"quota"`
}

func GetAllInviteRebateRecords(c *gin.Context) {
	pageInfo := common.GetPageQuery(c)
	items, total, err := model.GetAllInviteRebateRecords(c.Query("keyword"), pageInfo)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(items)
	common.ApiSuccess(c, pageInfo)
}

func GetInviteRebateStats(c *gin.Context) {
	stats, err := model.GetInviteRebateStats()
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, stats)
}

func GetInviteRebateUserByUsername(c *gin.Context) {
	username := strings.TrimSpace(c.Query("username"))
	user, err := model.GetInviteRebateUserByUsername(username)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, user)
}

func WithdrawInviteRebate(c *gin.Context) {
	var req InviteRebateWithdrawRequest
	if err := common.DecodeJson(c.Request.Body, &req); err != nil {
		common.ApiErrorMsg(c, "参数错误")
		return
	}
	if err := model.WithdrawInviteRebate(req.Username, req.Quota, c.GetInt("id")); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, nil)
}
