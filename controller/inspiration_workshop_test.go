package controller

import (
	"reflect"
	"strings"
	"testing"
)

func TestNormalizeInspirationWorkshopSettings(t *testing.T) {
	tests := []struct {
		name          string
		settings      InspirationWorkshopSettings
		want          InspirationWorkshopSettings
		wantError     bool
		errorContains string
	}{
		{
			name: "trims and deduplicates models",
			settings: InspirationWorkshopSettings{
				ImageModels:       []string{" gpt-image-2 ", "", "gpt-image-2", "qwen-image"},
				DefaultImageModel: "qwen-image",
			},
			want: InspirationWorkshopSettings{
				ImageModels:       []string{"gpt-image-2", "qwen-image"},
				DefaultImageModel: "qwen-image",
			},
		},
		{
			name: "uses first model as default",
			settings: InspirationWorkshopSettings{
				ImageModels: []string{"qwen-image", "gpt-image-2"},
			},
			want: InspirationWorkshopSettings{
				ImageModels:       []string{"qwen-image", "gpt-image-2"},
				DefaultImageModel: "qwen-image",
			},
		},
		{
			name:          "requires at least one model",
			settings:      InspirationWorkshopSettings{},
			wantError:     true,
			errorContains: "至少配置一个",
		},
		{
			name: "requires default to exist",
			settings: InspirationWorkshopSettings{
				ImageModels:       []string{"gpt-image-2"},
				DefaultImageModel: "qwen-image",
			},
			wantError:     true,
			errorContains: "默认模型",
		},
		{
			name: "rejects overly long model ID",
			settings: InspirationWorkshopSettings{
				ImageModels: []string{strings.Repeat("a", maxInspirationWorkshopModelIDLength+1)},
			},
			wantError:     true,
			errorContains: "长度不能超过",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			got, err := normalizeInspirationWorkshopSettings(test.settings)
			if test.wantError {
				if err == nil {
					t.Fatalf("expected error containing %q, got nil", test.errorContains)
				}
				if !strings.Contains(err.Error(), test.errorContains) {
					t.Fatalf("error %q does not contain %q", err.Error(), test.errorContains)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if !reflect.DeepEqual(got, test.want) {
				t.Fatalf("got %#v, want %#v", got, test.want)
			}
		})
	}
}
