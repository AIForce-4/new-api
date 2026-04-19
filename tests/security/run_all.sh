#!/usr/bin/env bash
# 一键跑完所有安全回归脚本
set -u
cd "$(dirname "$0")"

pass=0 fail=0 fails=()
run() {
  local name="$1"; shift
  echo
  echo "════════════════════════════════════════"
  echo " $name"
  echo "════════════════════════════════════════"
  if bash "$@"; then
    pass=$((pass+1))
  else
    fail=$((fail+1))
    fails+=("$name")
  fi
}

run "cross_channel_hijack"  ./cross_channel_hijack.sh
run "amount_mismatch"       ./amount_mismatch.sh
run "legit_flow"            ./legit_flow.sh
if [[ -n "${CREEM_WEBHOOK_SECRET:-}" && -n "${TARGET_TRADE_NO:-}" ]]; then
  run "creem_waffo_cross"   ./creem_waffo_cross.sh
else
  echo "(跳过 creem_waffo_cross：未提供 CREEM_WEBHOOK_SECRET / TARGET_TRADE_NO)"
fi

echo
echo "========== 总计 =========="
echo "通过: $pass"
echo "失败: $fail"
[[ $fail -eq 0 ]] || { printf '失败项: %s\n' "${fails[@]}"; exit 1; }
