package operation_setting

import "github.com/QuantumNous/new-api/setting/config"

type QuotaSetting struct {
	EnableFreeModelPreConsume                 bool    `json:"enable_free_model_pre_consume"` // 是否对免费模型启用预消耗
	InviteRebateRate                          float64 `json:"invite_rebate_rate"`
	InviteRebateMaxRewardCap                  float64 `json:"invite_rebate_max_reward_cap"`
	RecentIPLimit                             int     `json:"recent_ip_limit"`
	DisableInitialQuotaOnDuplicateRegisterIP bool    `json:"disable_initial_quota_on_duplicate_register_ip"`
	FirstRechargeDiscount                     int     `json:"first_recharge_discount"`
}

// 默认配置
var quotaSetting = QuotaSetting{
	EnableFreeModelPreConsume: true,
	InviteRebateRate:          5,
	InviteRebateMaxRewardCap:  100,
	FirstRechargeDiscount:     100,
}

func init() {
	// 注册到全局配置管理器
	config.GlobalConfig.Register("quota_setting", &quotaSetting)
}

func GetQuotaSetting() *QuotaSetting {
	return &quotaSetting
}
