package setting

import "github.com/QuantumNous/new-api/common"

// ValidatePaymentConfig runs after options are loaded to catch payment
// channels that are enabled but missing webhook secrets — a misconfig that
// would let unsigned/empty-HMAC webhooks pass verification. Any such channel
// is force-disabled with a CRITICAL log so admins notice on boot.
func ValidatePaymentConfig() {
	if StripeApiSecret != "" && StripePriceId != "" && StripeWebhookSecret == "" {
		common.SysLog("CRITICAL: Stripe 已启用但 webhook secret 为空，已自动关闭 Stripe 充值通道")
		StripeApiSecret = ""
	}

	if CreemApiKey != "" && CreemProducts != "[]" && CreemWebhookSecret == "" && !CreemTestMode {
		common.SysLog("CRITICAL: Creem 已启用但 webhook secret 为空，已自动关闭 Creem 充值通道")
		CreemApiKey = ""
	}

	if WaffoEnabled {
		missing := false
		if WaffoSandbox {
			if WaffoSandboxApiKey == "" || WaffoSandboxPrivateKey == "" || WaffoSandboxPublicCert == "" {
				missing = true
			}
		} else {
			if WaffoApiKey == "" || WaffoPrivateKey == "" || WaffoPublicCert == "" {
				missing = true
			}
		}
		if missing {
			common.SysLog("CRITICAL: Waffo 已启用但密钥/证书不完整，已自动关闭 Waffo 充值通道")
			WaffoEnabled = false
		}
	}
}
