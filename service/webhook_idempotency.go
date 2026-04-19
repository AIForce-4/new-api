package service

import (
	"fmt"
	"time"

	"github.com/QuantumNous/new-api/common"
)

// MarkWebhookEventProcessed atomically marks a webhook event as processed.
// Returns fresh=true if the event has not been seen before (caller should
// process it); fresh=false means the event id has been seen within ttl and
// should be ignored as a replay.
//
// When Redis is not enabled the helper returns fresh=true (fail-open),
// leaving idempotency to downstream order-status checks.
func MarkWebhookEventProcessed(channel string, eventID string, ttl time.Duration) (fresh bool, err error) {
	if eventID == "" {
		return true, nil
	}
	if !common.RedisEnabled {
		return true, nil
	}
	key := fmt.Sprintf("webhook:event:%s:%s", channel, eventID)
	return common.RedisSetNX(key, "1", ttl)
}
