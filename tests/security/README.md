# 支付通道劫持攻击回归测试

复现 2026-04-18 跨通道订单劫持攻击，验证修复是否生效。

## 攻击模型

1. 攻击者用合法会话下一张**易支付**大额订单，拿到 `USR{id}NO{rand}` 形式的 `trade_no`。
2. 攻击者用泄露的 `STRIPE_WEBHOOK_SECRET` 构造 `checkout.session.completed` 事件，
   `client_reference_id` 填上一步拿到的易支付 `trade_no`，`amount_total` 只填 $1。
3. 发给 `/api/stripe/webhook`。`model.Recharge` 若不校验 `PaymentMethod`，
   就会把易支付订单标记成功并按 `Money * QuotaPerUnit` 给攻击者发额度。

## ⚠️ 空 Secret 场景

经查 `options` 表无 `StripeWebhookSecret` 记录 → 服务端值为默认空串。
Stripe SDK 对空 secret 仍会做 `HMAC-SHA256("", payload)`，攻击者本地算出**完全相同**的签名 ⇒ 验签必过。
这就是本次事件的根因路径 1。

脚本已兼容：`STRIPE_WEBHOOK_SECRET` 不设置时默认空串，与服务端一致，**不用知道任何 secret 就能复现攻击**。

## 前置条件

- 跑脚本前**不要**合入修复补丁 —— 先复现攻击。
- 准备一个**测试账号**（不要用生产账号），登录拿到 session cookie。
- `STRIPE_WEBHOOK_SECRET` 留空即可。
- 可选：同时配置一个易支付商户（`操作 -> 支付` 里开启"易支付"），这样 `POST /api/user/pay` 能真正下单。
  若不想跑真实易支付，可直接写库造 pending 单，然后 `EPAY_TRADE_NO=USR...` 注入。

## 使用模式

每个脚本用 `EXPECT` 切换判定：

- `EXPECT=attack`（默认）：delta>0 算通过 → 用于**复现**
- `EXPECT=fixed`：delta==0 算通过 → 用于**修复后验证**

例：

```bash
# 1) 未打补丁时，确认漏洞存在
export BASE_URL=http://localhost:3000
export USER_COOKIE='session=...'
./cross_channel_hijack.sh          # 预期 🚨 攻击成功复现，exit 0

# 2) 打补丁后回归
EXPECT=fixed ./cross_channel_hijack.sh   # 预期 🛡️ 被拒，exit 0
```

## 脚本清单

| 脚本 | 验证目标 | 修复生效后预期 |
|---|---|---|
| `cross_channel_hijack.sh` | 易支付单 + Stripe webhook 劫持 | webhook 返回 200 但本地订单仍 pending、用户额度无变化 |
| `amount_mismatch.sh` | Stripe 单 + webhook 的 amount_total 与本地 Money 不符 | 被拒绝，订单 pending |
| `legit_flow.sh` | 金额一致的 Stripe 单正常回调 | 订单 success、额度增加 |
| `creem_waffo_cross.sh` | 用 Creem/Waffo webhook 去认领其他通道的单 | 被拒绝 |

所有脚本通过环境变量传配置，见各脚本头部注释。
