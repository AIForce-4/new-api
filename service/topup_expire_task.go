package service

import (
	"context"
	"fmt"
	"sync"
	"sync/atomic"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"

	"github.com/bytedance/gopkg/util/gopool"
)

const (
	staleTopUpExpireTickInterval = 5 * time.Minute
	staleTopUpExpireMaxAge       = 30 * time.Minute
	staleTopUpExpireBatchSize    = 300
)

var (
	staleTopUpExpireOnce    sync.Once
	staleTopUpExpireRunning atomic.Bool
)

// StartStaleTopUpExpireTask 启动待支付订单自动过期任务。
// 用户取消支付或关闭页面后， pending 订单不会自动失效；该任务把超过 staleTopUpExpireMaxAge
// 仍未支付的订单标记为 expired，避免永久占用首充优惠等权益。
func StartStaleTopUpExpireTask() {
	staleTopUpExpireOnce.Do(func() {
		if !common.IsMasterNode {
			return
		}
		gopool.Go(func() {
			logger.LogInfo(context.Background(), fmt.Sprintf("stale top-up expire task started: tick=%s, max_age=%s", staleTopUpExpireTickInterval, staleTopUpExpireMaxAge))
			ticker := time.NewTicker(staleTopUpExpireTickInterval)
			defer ticker.Stop()

			runStaleTopUpExpireOnce()
			for range ticker.C {
				runStaleTopUpExpireOnce()
			}
		})
	})
}

func runStaleTopUpExpireOnce() {
	if !staleTopUpExpireRunning.CompareAndSwap(false, true) {
		return
	}
	defer staleTopUpExpireRunning.Store(false)

	ctx := context.Background()
	totalExpired := int64(0)
	for {
		n, err := model.ExpireStalePendingTopUps(staleTopUpExpireMaxAge, staleTopUpExpireBatchSize)
		if err != nil {
			logger.LogWarn(ctx, fmt.Sprintf("stale top-up expire task failed: %v", err))
			return
		}
		totalExpired += n
		if n == 0 || n < int64(staleTopUpExpireBatchSize) {
			break
		}
	}
	if common.DebugEnabled && totalExpired > 0 {
		logger.LogDebug(ctx, "stale top-up expired: count=%d", totalExpired)
	}
}
