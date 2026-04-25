package model

import (
	"errors"
	"math"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"gorm.io/gorm"
)

type InviteRebateRecord struct {
	Id             int     `json:"id"`
	InviterId      int     `json:"inviter_id" gorm:"index;uniqueIndex:idx_invite_rebate_topup"`
	InviteeId      int     `json:"invitee_id" gorm:"index"`
	TopupId        int     `json:"topup_id" gorm:"index;uniqueIndex:idx_invite_rebate_topup"`
	TradeNo        string  `json:"trade_no" gorm:"type:varchar(255);index"`
	PaymentMethod  string  `json:"payment_method" gorm:"type:varchar(50)"`
	RechargeAmount float64 `json:"recharge_amount"`
	RewardAmount   float64 `json:"reward_amount"`
	RebateRate     float64 `json:"rebate_rate"`
	RewardCap      float64 `json:"reward_cap"`
	SettledBefore  float64 `json:"settled_before"`
	SettledAfter   float64 `json:"settled_after"`
	SettledAt      int64   `json:"settled_at" gorm:"index"`
}

type InviteRebateStats struct {
	TotalRecords        int64   `json:"total_records"`
	TotalRechargeAmount float64 `json:"total_recharge_amount"`
	TotalRewardAmount   float64 `json:"total_reward_amount"`
	UniqueInviterCount  int64   `json:"unique_inviter_count"`
	UniqueInviteeCount  int64   `json:"unique_invitee_count"`
}

type InviteRebateRecordView struct {
	Id              int     `json:"id"`
	InviterId       int     `json:"inviter_id"`
	InviterUsername string  `json:"inviter_username"`
	InviteeId       int     `json:"invitee_id"`
	InviteeUsername string  `json:"invitee_username"`
	TopupId         int     `json:"topup_id"`
	TradeNo         string  `json:"trade_no"`
	PaymentMethod   string  `json:"payment_method"`
	RechargeAmount  float64 `json:"recharge_amount"`
	RewardAmount    float64 `json:"reward_amount"`
	RebateRate      float64 `json:"rebate_rate"`
	RewardCap       float64 `json:"reward_cap"`
	SettledAt       int64   `json:"settled_at"`
}

type InviteRebateRewardProgress struct {
	CurrentRechargeAmount float64 `json:"current_recharge_amount"`
	MaxRechargeAmount     float64 `json:"max_recharge_amount"`
	ProgressPercent       float64 `json:"progress_percent"`
}

type InviteRebateUserItem struct {
	UserId                   int                        `json:"user_id"`
	UserIdentifier           string                     `json:"user_identifier"`
	InviteTime               int64                      `json:"invite_time"`
	TopupCount               int64                      `json:"topup_count"`
	CumulativeRechargeAmount float64                    `json:"cumulative_recharge_amount"`
	CumulativeRewardAmount   float64                    `json:"cumulative_reward_amount"`
	RewardProgress           InviteRebateRewardProgress `json:"reward_progress"`
}

type InviteRebateDetailItem struct {
	TopupId               int     `json:"topup_id"`
	TradeNo               string  `json:"trade_no"`
	Time                  int64   `json:"time"`
	InvitedUserId         int     `json:"invited_user_id"`
	InvitedUserIdentifier string  `json:"invited_user_identifier"`
	RechargeAmount        float64 `json:"recharge_amount"`
	RewardAmount          float64 `json:"reward_amount"`
}

type inviteRebateRecordAgg struct {
	InviteeId      int
	TopupCount     int64
	TotalRecharge  float64
	TotalReward    float64
	LastSettledAt  int64
}

func GetAllInviteRebateRecords(keyword string, pageInfo *common.PageInfo) ([]InviteRebateRecordView, int64, error) {
	query := DB.Model(&InviteRebateRecord{})
	if keyword != "" {
		like := "%" + keyword + "%"
		query = query.Where("trade_no LIKE ? OR payment_method LIKE ?", like, like)
		if id, err := strconv.Atoi(keyword); err == nil {
			query = query.Or("inviter_id = ? OR invitee_id = ? OR topup_id = ?", id, id, id)
		}
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var records []InviteRebateRecord
	if err := query.Order("settled_at desc, id desc").Limit(pageInfo.GetPageSize()).Offset(pageInfo.GetStartIdx()).Find(&records).Error; err != nil {
		return nil, 0, err
	}
	if len(records) == 0 {
		return []InviteRebateRecordView{}, total, nil
	}

	userIds := make([]int, 0, len(records)*2)
	for _, record := range records {
		userIds = append(userIds, record.InviterId, record.InviteeId)
	}

	var users []User
	if err := DB.Where("id IN ?", userIds).Find(&users).Error; err != nil {
		return nil, 0, err
	}
	userById := make(map[int]User, len(users))
	for _, user := range users {
		userById[user.Id] = user
	}

	views := make([]InviteRebateRecordView, 0, len(records))
	for _, record := range records {
		views = append(views, InviteRebateRecordView{
			Id:              record.Id,
			InviterId:       record.InviterId,
			InviterUsername: inviteRebateUserName(userById[record.InviterId]),
			InviteeId:       record.InviteeId,
			InviteeUsername: inviteRebateUserName(userById[record.InviteeId]),
			TopupId:         record.TopupId,
			TradeNo:         record.TradeNo,
			PaymentMethod:   record.PaymentMethod,
			RechargeAmount:  roundMoney(record.RechargeAmount),
			RewardAmount:    roundMoney(record.RewardAmount),
			RebateRate:      roundMoney(record.RebateRate),
			RewardCap:       roundMoney(record.RewardCap),
			SettledAt:       record.SettledAt,
		})
	}

	return views, total, nil
}

func GetInviteRebateStats() (*InviteRebateStats, error) {
	stats := &InviteRebateStats{}
	if err := DB.Model(&InviteRebateRecord{}).Count(&stats.TotalRecords).Error; err != nil {
		return nil, err
	}
	if err := DB.Model(&InviteRebateRecord{}).Select("COALESCE(SUM(recharge_amount), 0)").Scan(&stats.TotalRechargeAmount).Error; err != nil {
		return nil, err
	}
	if err := DB.Model(&InviteRebateRecord{}).Select("COALESCE(SUM(reward_amount), 0)").Scan(&stats.TotalRewardAmount).Error; err != nil {
		return nil, err
	}
	if err := DB.Model(&InviteRebateRecord{}).Distinct("inviter_id").Count(&stats.UniqueInviterCount).Error; err != nil {
		return nil, err
	}
	if err := DB.Model(&InviteRebateRecord{}).Distinct("invitee_id").Count(&stats.UniqueInviteeCount).Error; err != nil {
		return nil, err
	}
	stats.TotalRechargeAmount = roundMoney(stats.TotalRechargeAmount)
	stats.TotalRewardAmount = roundMoney(stats.TotalRewardAmount)
	return stats, nil
}

func GetInviteRebateUsers(inviterId int, pageInfo *common.PageInfo) ([]InviteRebateUserItem, int64, error) {
	var total int64
	query := DB.Model(&User{}).Where("inviter_id = ?", inviterId)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var users []User
	if err := query.Order("id desc").Limit(pageInfo.GetPageSize()).Offset(pageInfo.GetStartIdx()).Find(&users).Error; err != nil {
		return nil, 0, err
	}
	if len(users) == 0 {
		return []InviteRebateUserItem{}, total, nil
	}

	userIds := make([]int, 0, len(users))
	for _, user := range users {
		userIds = append(userIds, user.Id)
	}

	aggs := make([]inviteRebateRecordAgg, 0)
	if err := DB.Model(&InviteRebateRecord{}).
		Select("invitee_id, COUNT(*) as topup_count, COALESCE(SUM(recharge_amount), 0) as total_recharge, COALESCE(SUM(reward_amount), 0) as total_reward, COALESCE(MAX(settled_at), 0) as last_settled_at").
		Where("inviter_id = ? AND invitee_id IN ?", inviterId, userIds).
		Group("invitee_id").
		Scan(&aggs).Error; err != nil {
		return nil, 0, err
	}

	aggByUserId := make(map[int]inviteRebateRecordAgg, len(aggs))
	for _, agg := range aggs {
		aggByUserId[agg.InviteeId] = agg
	}

	items := make([]InviteRebateUserItem, 0, len(users))
	for _, user := range users {
		agg := aggByUserId[user.Id]
		items = append(items, InviteRebateUserItem{
			UserId:                   user.Id,
			UserIdentifier:           maskInviteRebateUser(user),
			InviteTime:               user.CreatedAt,
			TopupCount:               agg.TopupCount,
			CumulativeRechargeAmount: roundMoney(agg.TotalRecharge),
			CumulativeRewardAmount:   roundMoney(agg.TotalReward),
			RewardProgress:           buildInviteRebateProgressFromReward(agg.TotalReward),
		})
	}

	return items, total, nil
}

func GetInviteRebateDetails(inviterId int, pageInfo *common.PageInfo) ([]InviteRebateDetailItem, int64, error) {
	var total int64
	query := DB.Model(&InviteRebateRecord{}).Where("inviter_id = ?", inviterId)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var records []InviteRebateRecord
	if err := query.Order("settled_at desc, id desc").Limit(pageInfo.GetPageSize()).Offset(pageInfo.GetStartIdx()).Find(&records).Error; err != nil {
		return nil, 0, err
	}
	if len(records) == 0 {
		return []InviteRebateDetailItem{}, total, nil
	}

	inviteeIds := make([]int, 0, len(records))
	for _, record := range records {
		inviteeIds = append(inviteeIds, record.InviteeId)
	}

	var users []User
	if err := DB.Where("id IN ?", inviteeIds).Find(&users).Error; err != nil {
		return nil, 0, err
	}
	userById := make(map[int]User, len(users))
	for _, user := range users {
		userById[user.Id] = user
	}

	items := make([]InviteRebateDetailItem, 0, len(records))
	for _, record := range records {
		items = append(items, InviteRebateDetailItem{
			TopupId:               record.TopupId,
			TradeNo:               record.TradeNo,
			Time:                  record.SettledAt,
			InvitedUserId:         record.InviteeId,
			InvitedUserIdentifier: maskInviteRebateUser(userById[record.InviteeId]),
			RechargeAmount:        roundMoney(record.RechargeAmount),
			RewardAmount:          roundMoney(record.RewardAmount),
		})
	}

	return items, total, nil
}

func SettleInviteRebateForTopUpTx(tx *gorm.DB, topUp *TopUp) error {
	var invitee User
	if err := tx.Where("id = ?", topUp.UserId).First(&invitee).Error; err != nil {
		return err
	}
	if invitee.InviterId == 0 {
		return nil
	}

	var existing InviteRebateRecord
	err := tx.Where("inviter_id = ? AND topup_id = ?", invitee.InviterId, topUp.Id).First(&existing).Error
	if err == nil {
		return nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	rate, maxReward, _ := getInviteRebateConfig()
	rechargeAmount := roundMoney(topUp.Money)

	var settledBefore float64
	if err := tx.Model(&InviteRebateRecord{}).
		Select("COALESCE(SUM(reward_amount), 0)").
		Where("inviter_id = ? AND invitee_id = ?", invitee.InviterId, invitee.Id).
		Scan(&settledBefore).Error; err != nil {
		return err
	}
	settledBefore = roundMoney(settledBefore)

	remainingReward := maxReward - settledBefore
	if remainingReward < 0 {
		remainingReward = 0
	}

	rewardAmount := 0.0
	if rate > 0 && rechargeAmount > 0 && remainingReward > 0 {
		rewardAmount = roundMoney(math.Min(rechargeAmount*rate, remainingReward))
	}
	settledAfter := roundMoney(settledBefore + rewardAmount)
	settledAt := topUp.CompleteTime
	if settledAt == 0 {
		settledAt = common.GetTimestamp()
	}

	record := InviteRebateRecord{
		InviterId:      invitee.InviterId,
		InviteeId:      invitee.Id,
		TopupId:        topUp.Id,
		TradeNo:        topUp.TradeNo,
		PaymentMethod:  topUp.PaymentMethod,
		RechargeAmount: rechargeAmount,
		RewardAmount:   rewardAmount,
		RebateRate:     roundMoney(rate * 100),
		RewardCap:      roundMoney(maxReward),
		SettledBefore:  settledBefore,
		SettledAfter:   settledAfter,
		SettledAt:      settledAt,
	}
	if err := tx.Create(&record).Error; err != nil {
		return err
	}

	if rewardAmount <= 0 {
		return nil
	}
	rewardQuota := int(math.Round(rewardAmount * common.QuotaPerUnit))
	return tx.Model(&User{}).Where("id = ?", invitee.InviterId).Updates(map[string]interface{}{
		"aff_quota":   gorm.Expr("aff_quota + ?", rewardQuota),
		"aff_history": gorm.Expr("aff_history + ?", rewardQuota),
	}).Error
}

func buildInviteRebateProgressFromReward(totalReward float64) InviteRebateRewardProgress {
	_, maxReward, maxRecharge := getInviteRebateConfig()
	if maxReward <= 0 {
		return InviteRebateRewardProgress{}
	}
	reward := math.Min(totalReward, maxReward)
	if reward < 0 {
		reward = 0
	}
	return InviteRebateRewardProgress{
		CurrentRechargeAmount: roundMoney(reward),
		MaxRechargeAmount:     roundMoney(maxRecharge),
		ProgressPercent:       roundMoney(reward / maxReward * 100),
	}
}

func getInviteRebateConfig() (rate float64, maxReward float64, maxRecharge float64) {
	quotaSetting := operation_setting.GetQuotaSetting()
	maxReward = quotaSetting.InviteRebateMaxRewardCap
	rate = quotaSetting.InviteRebateRate / 100
	if rate <= 0 || maxReward <= 0 {
		return 0, maxReward, 0
	}
	return rate, maxReward, maxReward / rate
}

func maskInviteRebateUser(user User) string {
	if user.Email != "" {
		return common.MaskEmail(user.Email)
	}
	name := user.DisplayName
	if name == "" {
		name = user.Username
	}
	name = strings.TrimSpace(name)
	if name == "" {
		return "***"
	}
	runes := []rune(name)
	if len(runes) <= 1 {
		return "***"
	}
	return string(runes[0]) + strings.Repeat("*", len(runes)-1)
}

func inviteRebateUserName(user User) string {
	if user.DisplayName != "" {
		return user.DisplayName
	}
	if user.Username != "" {
		return user.Username
	}
	return "-"
}

func roundMoney(value float64) float64 {
	return math.Round(value*100) / 100
}
