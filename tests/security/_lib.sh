#!/usr/bin/env bash
# 共享函数库：依赖检查、Stripe 签名、用户额度查询等
set -euo pipefail

: "${BASE_URL:?need BASE_URL, e.g. http://localhost:3000}"
: "${USER_COOKIE:?need USER_COOKIE (session=...; 从浏览器 DevTools 拷贝 Cookie 整行)}"
: "${USER_ID:?need USER_ID (测试账号的用户 ID；DevTools -> LocalStorage 里能看到，或仪表盘 URL)}"
# STRIPE_WEBHOOK_SECRET 可为空：若服务端未配置，空 secret 双方一致，HMAC 必过 —— 这正是漏洞所在。
: "${STRIPE_WEBHOOK_SECRET:=}"

CURL_OPTS=(-sS --max-time 15)
AUTH_HEADERS=(-H "Cookie: $USER_COOKIE" -H "New-Api-User: $USER_ID")

check_deps() {
  for cmd in curl openssl jq python3; do
    command -v "$cmd" >/dev/null || { echo "缺少依赖: $cmd" >&2; exit 1; }
  done
}

# 读取当前登录用户信息，返回 JSON 的 data 字段
get_self() {
  curl "${CURL_OPTS[@]}" "${AUTH_HEADERS[@]}" \
    "$BASE_URL/api/user/self" | jq -c '.data'
}

get_quota() {
  get_self | jq -r '.quota // empty'
}

get_user_id() {
  get_self | jq -r '.id // empty'
}

# Stripe 官方签名算法：header = "t={ts},v1={hex(hmac_sha256(secret, ts+"."+payload))}"
# 用法： stripe_sign <secret> <payload_json>
stripe_sign() {
  local secret="$1" payload="$2" ts sig
  ts="$(date +%s)"
  sig="$(printf '%s.%s' "$ts" "$payload" \
    | openssl dgst -sha256 -hmac "$secret" -hex | awk '{print $2}')"
  printf 't=%s,v1=%s' "$ts" "$sig"
}

# 生成一个 checkout.session.completed 事件 JSON
# 用法： build_stripe_event <client_reference_id> <amount_total_cents> <currency>
build_stripe_event() {
  local ref="$1" amount="$2" currency="${3:-usd}"
  local evt_id="evt_test_$(openssl rand -hex 8)"
  local cs_id="cs_test_$(openssl rand -hex 8)"
  python3 -c "
import json,sys
print(json.dumps({
  'id': '$evt_id',
  'object': 'event',
  'api_version': '2024-06-20',
  'created': $(date +%s),
  'type': 'checkout.session.completed',
  'data': {
    'object': {
      'id': '$cs_id',
      'object': 'checkout.session',
      'client_reference_id': '$ref',
      'customer': 'cus_test_$(openssl rand -hex 6)',
      'amount_total': $amount,
      'currency': '$currency',
      'status': 'complete',
      'mode': 'payment',
      'payment_status': 'paid'
    }
  }
}, separators=(',',':')))
"
}

post_stripe_webhook() {
  local payload="$1" sig_header="$2"
  curl "${CURL_OPTS[@]}" -o /tmp/stripe_wh_resp.$$ -w '%{http_code}' \
    -H "Content-Type: application/json" \
    -H "Stripe-Signature: $sig_header" \
    -X POST --data-raw "$payload" \
    "$BASE_URL/api/stripe/webhook"
  local rc=$?
  echo
  if [[ -s /tmp/stripe_wh_resp.$$ ]]; then
    echo "--- webhook response body ---"
    cat /tmp/stripe_wh_resp.$$
    echo
  fi
  rm -f /tmp/stripe_wh_resp.$$
  return $rc
}

# 创建一张易支付订单（需要商户已配置），回显 tradeNo
# 用法： create_epay_order <amount>
create_epay_order() {
  local amount="$1"
  local body
  body=$(curl "${CURL_OPTS[@]}" "${AUTH_HEADERS[@]}" \
    -H "Content-Type: application/json" \
    -X POST --data-raw "{\"amount\":$amount,\"payment_method\":\"alipay\"}" \
    "$BASE_URL/api/user/pay")
  local msg
  msg=$(printf '%s' "$body" | jq -r '.message')
  if [[ "$msg" != "success" ]]; then
    echo "易支付下单失败：$body" >&2
    return 1
  fi
  # tradeNo 在 params.out_trade_no 或 params 里，字段随 epay SDK 不同。兜底 grep USR\d+NO
  printf '%s' "$body" | jq -r '.data.out_trade_no // .data.pid // empty' \
    | grep -Eo 'USR[0-9]+NO[A-Za-z0-9]+' | head -n1 \
    || printf '%s' "$body" | grep -Eo 'USR[0-9]+NO[A-Za-z0-9]+' | head -n1
}

# 创建 Stripe 订单，返回 ref_xxx tradeNo（从 pay_link 的 client_reference_id 推断不容易，
# 故直接查询 TopUp 表可能更稳；这里简单做法：调用后立刻读取最近一条 pending 单的 trade_no）
# 用法： create_stripe_order <amount>
create_stripe_order() {
  local amount="$1"
  local body
  body=$(curl "${CURL_OPTS[@]}" "${AUTH_HEADERS[@]}" \
    -H "Content-Type: application/json" \
    -X POST --data-raw "{\"amount\":$amount,\"payment_method\":\"stripe\"}" \
    "$BASE_URL/api/user/stripe/pay")
  local msg
  msg=$(printf '%s' "$body" | jq -r '.message')
  if [[ "$msg" != "success" ]]; then
    echo "Stripe 下单失败：$body" >&2
    return 1
  fi
  # 从 pay_link 里拿 client_reference_id
  local link
  link=$(printf '%s' "$body" | jq -r '.data.pay_link')
  # Stripe Checkout 页面会把 client_reference_id 作为参数，但真正的 ref 在创建 session 时就已分配。
  # 这里通过 `/api/user/topup/self` 拿到刚创建的最新一条记录。
  curl "${CURL_OPTS[@]}" "${AUTH_HEADERS[@]}" \
    "$BASE_URL/api/user/topup/self?p=1&page_size=1" \
    | jq -r '.data.items[0].trade_no // .data[0].trade_no // empty'
}

assert_eq() {
  local name="$1" actual="$2" expected="$3"
  if [[ "$actual" == "$expected" ]]; then
    echo "  ✅ $name: $actual"
  else
    echo "  ❌ $name: got $actual, want $expected" >&2
    return 1
  fi
}

assert_ne() {
  local name="$1" actual="$2" forbidden="$3"
  if [[ "$actual" != "$forbidden" ]]; then
    echo "  ✅ $name: $actual (≠ $forbidden)"
  else
    echo "  ❌ $name: must not equal $forbidden" >&2
    return 1
  fi
}
