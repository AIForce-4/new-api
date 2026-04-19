#!/usr/bin/env bash
# 回归：金额一致的 Stripe 单走正常回调，应当成功入账。
# 此脚本无论修复前后都应 delta>0；若修复后反而=0，说明修复过严误伤合法路径。
#
# 环境变量：BASE_URL / USER_COOKIE / STRIPE_WEBHOOK_SECRET（可空）/ STRIPE_AMOUNT
set -euo pipefail
cd "$(dirname "$0")"
# shellcheck source=_lib.sh
source ./_lib.sh
check_deps
: "${STRIPE_AMOUNT:=10}"
: "${STRIPE_AMOUNT_TOTAL:=$(( STRIPE_AMOUNT * 100 ))}"

quota_before=$(get_quota)
trade_no=$(create_stripe_order "$STRIPE_AMOUNT")
[[ -n "$trade_no" ]] || { echo "下单失败" >&2; exit 2; }
echo "  tradeNo=$trade_no amount_total_cents=$STRIPE_AMOUNT_TOTAL"

payload=$(build_stripe_event "$trade_no" "$STRIPE_AMOUNT_TOTAL" usd)
sig=$(stripe_sign "$STRIPE_WEBHOOK_SECRET" "$payload")
post_stripe_webhook "$payload" "$sig" >/dev/null || true

sleep 1
quota_after=$(get_quota)
delta=$(( quota_after - quota_before ))

if [[ "$delta" -gt 0 ]]; then
  echo "✅ 合法支付流程未受影响：quota 增加 $delta。"
  exit 0
else
  echo "❌ 合法路径被误伤：quota 未变化，检查修复是否过严。" >&2
  exit 1
fi
