package model

import (
	"database/sql"
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"gorm.io/gorm"
)

const (
	InviteRebateRecordTypeReward     = "reward"
	InviteRebateRecordTypeWithdrawal = "withdrawal"
	InviteRebateRecordTypeTransfer   = "transfer"
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
	RecordType     string  `json:"type" gorm:"type:varchar(32);column:record_type;index"`
	OperatorId     int     `json:"operator_id" gorm:"index"`
	Remark         string  `json:"remark" gorm:"type:varchar(255)"`
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
	Type            string  `json:"type"`
	Remark          string  `json:"remark"`
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
	InviteAbnormal           bool                       `json:"invite_abnormal"`
	InviteTags               []string                   `json:"invite_tags"`
}

type InviteRebateDetailItem struct {
	TopupId               int     `json:"topup_id"`
	TradeNo               string  `json:"trade_no"`
	Time                  int64   `json:"time"`
	InvitedUserId         int     `json:"invited_user_id"`
	InvitedUserIdentifier string  `json:"invited_user_identifier"`
	RechargeAmount        float64 `json:"recharge_amount"`
	RewardAmount          float64 `json:"reward_amount"`
	Type                  string  `json:"type"`
	Remark                string  `json:"remark"`
	OperatorUsername      string  `json:"operator_username,omitempty"`
}

type InviteRebateUserBalance struct {
	Id              int    `json:"id"`
	Username        string `json:"username"`
	DisplayName     string `json:"display_name"`
	AffQuota        int    `json:"aff_quota"`
	AffHistoryQuota int    `json:"aff_history_quota"`
	AffCount        int    `json:"aff_count"`
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
			Type:            inviteRebateRecordType(record),
			Remark:          record.Remark,
		})
	}

	return views, total, nil
}

func GetInviteRebateStats() (*InviteRebateStats, error) {
	stats := &InviteRebateStats{}
	rewardQuery := DB.Model(&InviteRebateRecord{}).Where("record_type = ? OR record_type = ?", InviteRebateRecordTypeReward, "")
	if err := rewardQuery.Count(&stats.TotalRecords).Error; err != nil {
		return nil, err
	}
	if err := DB.Model(&InviteRebateRecord{}).Where("record_type = ? OR record_type = ?", InviteRebateRecordTypeReward, "").Select("COALESCE(SUM(recharge_amount), 0)").Scan(&stats.TotalRechargeAmount).Error; err != nil {
		return nil, err
	}
	if err := DB.Model(&InviteRebateRecord{}).Where("record_type = ? OR record_type = ?", InviteRebateRecordTypeReward, "").Select("COALESCE(SUM(reward_amount), 0)").Scan(&stats.TotalRewardAmount).Error; err != nil {
		return nil, err
	}
	if err := DB.Model(&InviteRebateRecord{}).Where("record_type = ? OR record_type = ?", InviteRebateRecordTypeReward, "").Distinct("inviter_id").Count(&stats.UniqueInviterCount).Error; err != nil {
		return nil, err
	}
	if err := DB.Model(&InviteRebateRecord{}).Where("record_type = ? OR record_type = ?", InviteRebateRecordTypeReward, "").Distinct("invitee_id").Count(&stats.UniqueInviteeCount).Error; err != nil {
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
		inviteTags := []string{}
		if user.InviteAbnormal {
			inviteTags = append(inviteTags, "异常")
		}
		items = append(items, InviteRebateUserItem{
			UserId:                   user.Id,
			UserIdentifier:           maskInviteRebateUser(user),
			InviteTime:               user.CreatedAt,
			TopupCount:               agg.TopupCount,
			CumulativeRechargeAmount: roundMoney(agg.TotalRecharge),
			CumulativeRewardAmount:   roundMoney(agg.TotalReward),
			RewardProgress:           buildInviteRebateProgressFromReward(agg.TotalReward),
			InviteAbnormal:           user.InviteAbnormal,
			InviteTags:               inviteTags,
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
	operatorIds := make([]int, 0, len(records))
	for _, record := range records {
		if record.InviteeId > 0 {
			inviteeIds = append(inviteeIds, record.InviteeId)
		}
		if record.OperatorId > 0 {
			operatorIds = append(operatorIds, record.OperatorId)
		}
	}

	userById := map[int]User{}
	if len(inviteeIds) > 0 {
		var users []User
		if err := DB.Where("id IN ?", inviteeIds).Find(&users).Error; err != nil {
			return nil, 0, err
		}
		for _, user := range users {
			userById[user.Id] = user
		}
	}

	operatorById := map[int]User{}
	if len(operatorIds) > 0 {
		var operators []User
		if err := DB.Where("id IN ?", operatorIds).Find(&operators).Error; err != nil {
			return nil, 0, err
		}
		for _, user := range operators {
			operatorById[user.Id] = user
		}
	}

	items := make([]InviteRebateDetailItem, 0, len(records))
	for _, record := range records {
		item := InviteRebateDetailItem{
			TopupId:        record.TopupId,
			TradeNo:        record.TradeNo,
			Time:           record.SettledAt,
			RechargeAmount: roundMoney(record.RechargeAmount),
			RewardAmount:   roundMoney(record.RewardAmount),
			Type:           inviteRebateRecordType(record),
			Remark:         record.Remark,
		}
		if record.InviteeId > 0 {
			item.InvitedUserId = record.InviteeId
			item.InvitedUserIdentifier = maskInviteRebateUser(userById[record.InviteeId])
		}
		if record.OperatorId > 0 {
			item.OperatorUsername = inviteRebateUserName(operatorById[record.OperatorId])
		}
		items = append(items, item)
	}

	return items, total, nil
}

func GetInviteRebateUserByUsername(username string) (*InviteRebateUserBalance, error) {
	username = strings.TrimSpace(username)
	if username == "" {
		return nil, errors.New("用户名不能为空")
	}
	var user User
	if err := DB.Where("username = ?", username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户不存在")
		}
		return nil, err
	}
	return &InviteRebateUserBalance{
		Id:              user.Id,
		Username:        user.Username,
		DisplayName:     user.DisplayName,
		AffQuota:        user.AffQuota,
		AffHistoryQuota: user.AffHistoryQuota,
		AffCount:        user.AffCount,
	}, nil
}

func WithdrawInviteRebate(username string, quota int, operatorId int) error {
	username = strings.TrimSpace(username)
	if username == "" {
		return errors.New("用户名不能为空")
	}
	if quota <= 0 {
		return errors.New("提现金额必须大于 0")
	}

	var target User
	err := DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Set("gorm:query_option", "FOR UPDATE").Where("username = ?", username).First(&target).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("用户不存在")
			}
			return err
		}
		if target.AffQuota < quota {
			return errors.New("返佣余额不足")
		}

		target.AffQuota -= quota
		if err := tx.Model(&User{}).Where("id = ?", target.Id).Update("aff_quota", target.AffQuota).Error; err != nil {
			return err
		}

		amount := roundMoney(float64(quota) / common.QuotaPerUnit)
		topupId, err := nextInviteRebateSpecialTopupIdTx(tx, target.Id, InviteRebateRecordTypeWithdrawal)
		if err != nil {
			return err
		}
		record := InviteRebateRecord{
			InviterId:     target.Id,
			TopupId:       topupId,
			PaymentMethod: InviteRebateRecordTypeWithdrawal,
			RewardAmount:  amount,
			SettledAt:     common.GetTimestamp(),
			RecordType:    InviteRebateRecordTypeWithdrawal,
			OperatorId:    operatorId,
			Remark:        "返佣提现",
		}
		return tx.Create(&record).Error
	})
	if err != nil {
		return err
	}

	RecordLog(target.Id, LogTypeManage, fmt.Sprintf("管理员处理返佣提现，扣减返佣额度：%s", logger.LogQuota(quota)))
	return nil
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
	if invitee.InviteAbnormal {
		rewardAmount = 0
		settledAfter = settledBefore
	}
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
		RecordType:     InviteRebateRecordTypeReward,
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

func inviteRebateRecordType(record InviteRebateRecord) string {
	if record.RecordType != "" {
		return record.RecordType
	}
	return InviteRebateRecordTypeReward
}

func nextInviteRebateSpecialTopupIdTx(tx *gorm.DB, userId int, recordType string) (int, error) {
	var minTopupId sql.NullInt64
	if err := tx.Model(&InviteRebateRecord{}).
		Where("inviter_id = ? AND record_type IN ?", userId, []string{InviteRebateRecordTypeWithdrawal, InviteRebateRecordTypeTransfer}).
		Select("COALESCE(MIN(topup_id), 0)").
		Scan(&minTopupId).Error; err != nil {
		return 0, err
	}
	next := minTopupId.Int64 - 1
	if next >= 0 {
		next = -1
	}
	return int(next), nil
}

func RecordInviteRebateTransferTx(tx *gorm.DB, userId int, quota int) error {
	if quota <= 0 {
		return errors.New("划转金额必须大于 0")
	}
	topupId, err := nextInviteRebateSpecialTopupIdTx(tx, userId, InviteRebateRecordTypeTransfer)
	if err != nil {
		return err
	}
	record := InviteRebateRecord{
		InviterId:     userId,
		TopupId:       topupId,
		PaymentMethod: InviteRebateRecordTypeTransfer,
		RewardAmount:  roundMoney(float64(quota) / common.QuotaPerUnit),
		SettledAt:     common.GetTimestamp(),
		RecordType:    InviteRebateRecordTypeTransfer,
		Remark:        "转入钱包",
	}
	return tx.Create(&record).Error
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
