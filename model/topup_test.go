package model

import (
	"testing"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/require"
)

func insertUser(t *testing.T) *User {
	t.Helper()
	user := &User{
		Username: "testuser",
		Status:   common.UserStatusEnabled,
	}
	require.NoError(t, DB.Create(user).Error)
	return user
}

func TestCancelTopUpByUser_KeepsFirstRechargeDiscount(t *testing.T) {
	truncateTables(t)
	user := insertUser(t)

	topUp := &TopUp{
		UserId:                       user.Id,
		Amount:                       10,
		Money:                        1.0,
		TradeNo:                      "TEST-001",
		PaymentMethod:                "epay",
		CreateTime:                   common.GetTimestamp(),
		Status:                       common.TopUpStatusPending,
		FirstRechargeDiscountApplied: true,
	}
	require.NoError(t, topUp.Insert())

	err := CancelTopUpByUser(topUp.TradeNo, user.Id)
	require.NoError(t, err)

	updated := GetTopUpByTradeNo(topUp.TradeNo)
	require.NotNil(t, updated)
	require.Equal(t, common.TopUpStatusExpired, updated.Status)

	var userAfter User
	require.NoError(t, DB.First(&userAfter, user.Id).Error)
	require.False(t, userAfter.FirstRechargeDiscountUsed, "取消首充优惠订单后首充资格应保留")
}

func TestCancelTopUpByUser_NonDiscountOrderDoesNotAffectDiscount(t *testing.T) {
	truncateTables(t)
	user := insertUser(t)

	topUp := &TopUp{
		UserId:                       user.Id,
		Amount:                       10,
		Money:                        1.0,
		TradeNo:                      "TEST-002",
		PaymentMethod:                "epay",
		CreateTime:                   common.GetTimestamp(),
		Status:                       common.TopUpStatusPending,
		FirstRechargeDiscountApplied: false,
	}
	require.NoError(t, topUp.Insert())

	err := CancelTopUpByUser(topUp.TradeNo, user.Id)
	require.NoError(t, err)

	var userAfter User
	require.NoError(t, DB.First(&userAfter, user.Id).Error)
	require.False(t, userAfter.FirstRechargeDiscountUsed, "非首充优惠订单取消不应影响首充资格")
}

func TestExpireStalePendingTopUps_KeepsFirstRechargeDiscount(t *testing.T) {
	truncateTables(t)
	user := insertUser(t)

	oldTime := common.GetTimestamp() - int64((31 * time.Minute).Seconds())
	topUp := &TopUp{
		UserId:                       user.Id,
		Amount:                       10,
		Money:                        1.0,
		TradeNo:                      "TEST-003",
		PaymentMethod:                "epay",
		CreateTime:                   oldTime,
		Status:                       common.TopUpStatusPending,
		FirstRechargeDiscountApplied: true,
	}
	require.NoError(t, topUp.Insert())

	n, err := ExpireStalePendingTopUps(30*time.Minute, 100)
	require.NoError(t, err)
	require.Equal(t, int64(1), n)

	updated := GetTopUpByTradeNo(topUp.TradeNo)
	require.NotNil(t, updated)
	require.Equal(t, common.TopUpStatusExpired, updated.Status)

	var userAfter User
	require.NoError(t, DB.First(&userAfter, user.Id).Error)
	require.False(t, userAfter.FirstRechargeDiscountUsed, "过期首充优惠订单后首充资格应保留")
}

func TestExpireStalePendingTopUps_RecentOrderUnchanged(t *testing.T) {
	truncateTables(t)
	user := insertUser(t)

	topUp := &TopUp{
		UserId:                       user.Id,
		Amount:                       10,
		Money:                        1.0,
		TradeNo:                      "TEST-004",
		PaymentMethod:                "epay",
		CreateTime:                   common.GetTimestamp(),
		Status:                       common.TopUpStatusPending,
		FirstRechargeDiscountApplied: true,
	}
	require.NoError(t, topUp.Insert())

	n, err := ExpireStalePendingTopUps(30*time.Minute, 100)
	require.NoError(t, err)
	require.Equal(t, int64(0), n)

	updated := GetTopUpByTradeNo(topUp.TradeNo)
	require.NotNil(t, updated)
	require.Equal(t, common.TopUpStatusPending, updated.Status)

	var userAfter User
	require.NoError(t, DB.First(&userAfter, user.Id).Error)
	require.False(t, userAfter.FirstRechargeDiscountUsed, "未过期订单不应影响首充资格")
}
