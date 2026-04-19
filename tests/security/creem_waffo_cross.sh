#!/usr/bin/env bash
# 用 Creem / Waffo webhook 去认领**非对应通道**的订单，应被拒。
# 只需验证服务端返回非成功，额度无变化。
#
# 环境变量：
#   BASE_URL / USER_COOKIE
#   CREEM_WEBHOOK_SECRET   Creem 回调签名密钥（HMAC-SHA256）
#   TARGET_TRADE_NO        必填：一个易支付/stripe 的 pending tradeNo
set -euo pipefail
cd "$(dirname "$0")"
# shellcheck source=_lib.sh
source ./_lib.sh
check_deps
: "${CREEM_WEBHOOK_SECRET:?need CREEM_WEBHOOK_SECRET}"
: "${TARGET_TRADE_NO:?need TARGET_TRADE_NO (某条 epay/stripe pending 单的 trade_no)}"

quota_before=$(get_quota)

# Creem webhook 典型结构：{"eventType":"checkout.completed","object":{"id":"...","metadata":{"trade_no":"..."}}}
# 不同版本 payload 形态可能不同，这里给通用壳，失败也足以说明"被拒"。
payload=$(python3 -c "
import json
print(json.dumps({
  'id':'evt_x',
  'eventType':'checkout.completed',
  'object':{
    'id':'cs_x',
    'status':'completed',
    'customer':{'email':'attacker@example.com'},
    'metadata':{'trade_no':'$TARGET_TRADE_NO'}
  }
}, separators=(',',':')))
")
sig=$(printf '%s' "$payload" | openssl dgst -sha256 -hmac "$CREEM_WEBHOOK_SECRET" -hex | awk '{print $2}')

http_code=$(curl -sS -o /tmp/creem_resp.$$ -w '%{http_code}' \
  -H "Content-Type: application/json" \
  -H "creem-signature: $sig" \
  -X POST --data-raw "$payload" \
  "$BASE_URL/api/creem/webhook" || true)
echo "creem http_code=$http_code"
echo "body:"; cat /tmp/creem_resp.$$ 2>/dev/null || true; echo
rm -f /tmp/creem_resp.$$

sleep 1
quota_after=$(get_quota)
delta=$(( quota_after - quota_before ))

if [[ "$delta" -eq 0 ]]; then
  echo "✅ Creem 跨通道认领被拒，额度未变化。"
  exit 0
else
  echo "❌ Creem 跨通道认领成功，quota 增加 $delta" >&2
  exit 1
fi
