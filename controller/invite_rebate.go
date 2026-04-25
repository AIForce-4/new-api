package controller

import (
	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

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
