package controller

import (
	"strings"
	"testing"
)

func TestValidateHomeNoticeSettings(t *testing.T) {
	tests := []struct {
		name          string
		settings      HomeNoticeSettings
		wantError     bool
		errorContains string
	}{
		{
			name:      "disabled settings may be empty",
			settings:  HomeNoticeSettings{Enabled: false},
			wantError: false,
		},
		{
			name:          "enabled popup requires content or QR code",
			settings:      HomeNoticeSettings{Enabled: true},
			wantError:     true,
			errorContains: "至少填写一项",
		},
		{
			name: "accepts site relative QR code path",
			settings: HomeNoticeSettings{
				Enabled:        true,
				QRCodeImageURL: "/pricing-contact-qr.jpg",
			},
			wantError: false,
		},
		{
			name: "accepts HTTPS QR code URL",
			settings: HomeNoticeSettings{
				Enabled:        true,
				QRCodeImageURL: "https://example.com/qr.png",
			},
			wantError: false,
		},
		{
			name: "rejects protocol relative QR code URL",
			settings: HomeNoticeSettings{
				Enabled:        true,
				QRCodeImageURL: "//example.com/qr.png",
			},
			wantError:     true,
			errorContains: "格式不正确",
		},
		{
			name: "rejects unsupported URL scheme",
			settings: HomeNoticeSettings{
				Enabled:        true,
				QRCodeImageURL: "javascript:alert(1)",
			},
			wantError:     true,
			errorContains: "http/https",
		},
		{
			name: "accepts QR-only popup",
			settings: HomeNoticeSettings{
				Enabled:        true,
				QRCodeImageURL: "https://example.com/qr.png",
			},
			wantError: false,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := validateHomeNoticeSettings(test.settings)
			if test.wantError && err == nil {
				t.Fatalf("expected error containing %q, got nil", test.errorContains)
			}
			if !test.wantError && err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if test.wantError && !strings.Contains(err.Error(), test.errorContains) {
				t.Fatalf("error %q does not contain %q", err.Error(), test.errorContains)
			}
		})
	}
}
