package model

import (
	"time"

	"github.com/QuantumNous/new-api/common"
	"gorm.io/gorm"
)

// ProviderType identifies the wallet provider's API protocol.
type ProviderType string

const (
	ProviderTypeNewAPI       ProviderType = "new-api"       // 格瓦斯, 星辰AI (standard new-api protocol)
	ProviderTypeNekoCode     ProviderType = "nekocode"      // NekoCode (new-api + HMAC-SHA256 sign)
	ProviderTypePincc        ProviderType = "pincc"         // Pincc (JWT Bearer)
	ProviderTypeAICodeMirror ProviderType = "aicodemirror"  // AICodeMirror (NextAuth cookie)
)

// BalanceCurrency is the currency unit of the balance field.
type BalanceCurrency string

const (
	BalanceCurrencyUSD BalanceCurrency = "USD"
	BalanceCurrencyCNY BalanceCurrency = "CNY"
)

// ProviderWallet stores the configuration and balance state of an upstream AI provider.
type ProviderWallet struct {
	ID   int    `json:"id" gorm:"primaryKey;autoIncrement"`
	Name string `json:"name" gorm:"type:varchar(100);not null"`
	// Type determines which checker implementation to use.
	Type    ProviderType `json:"type" gorm:"type:varchar(32);not null"`
	BaseURL string       `json:"base_url" gorm:"type:varchar(256);not null"`

	// Credentials — password is AES-encrypted at rest.
	Username          string `json:"username" gorm:"type:varchar(256)"`
	PasswordEncrypted string `json:"-" gorm:"type:varchar(512)"`
	// ExtraConfig holds provider-specific fields (e.g. Pincc email, AICodeMirror phone).
	ExtraConfig string `json:"extra_config" gorm:"type:text"`

	// Scheduling: how often (minutes) the balance should be refreshed automatically.
	// 0 means disabled (manual-only).
	CheckIntervalMinutes int `json:"check_interval_minutes" gorm:"default:60"`

	// Balance state
	LastBalance        float64         `json:"last_balance"`
	BalanceCurrency    BalanceCurrency `json:"balance_currency" gorm:"type:varchar(8);default:'USD'"`
	TodayStartBalance  float64         `json:"today_start_balance"`
	TodayStartDate     string          `json:"today_start_date" gorm:"type:varchar(16)"` // "2006-01-02"
	LastCheckedAt      *time.Time      `json:"last_checked_at"`

	Enabled   bool           `json:"enabled" gorm:"default:true"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

func (ProviderWallet) TableName() string {
	return "provider_wallets"
}

// SetPassword encrypts the given plaintext password and stores it.
func (pw *ProviderWallet) SetPassword(plaintext string) error {
	if plaintext == "" {
		pw.PasswordEncrypted = ""
		return nil
	}
	enc, err := common.EncryptAES(plaintext)
	if err != nil {
		return err
	}
	pw.PasswordEncrypted = enc
	return nil
}

// GetPassword decrypts and returns the plaintext password.
func (pw *ProviderWallet) GetPassword() (string, error) {
	if pw.PasswordEncrypted == "" {
		return "", nil
	}
	return common.DecryptAES(pw.PasswordEncrypted)
}

// TodaySpend returns how much balance has been consumed today (positive = spent).
func (pw *ProviderWallet) TodaySpend() float64 {
	today := time.Now().Format("2006-01-02")
	if pw.TodayStartDate != today {
		return 0
	}
	spend := pw.TodayStartBalance - pw.LastBalance
	if spend < 0 {
		return 0
	}
	return spend
}

// UpdateBalance updates balance fields after a successful check.
// It automatically handles the today-start snapshot logic.
func (pw *ProviderWallet) UpdateBalance(newBalance float64) {
	today := time.Now().Format("2006-01-02")
	if pw.TodayStartDate != today {
		pw.TodayStartDate = today
		pw.TodayStartBalance = newBalance
	}
	pw.LastBalance = newBalance
	now := time.Now()
	pw.LastCheckedAt = &now
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

func GetAllProviderWallets() ([]*ProviderWallet, error) {
	var wallets []*ProviderWallet
	err := DB.Where("deleted_at IS NULL").Order("id asc").Find(&wallets).Error
	return wallets, err
}

func GetProviderWalletByID(id int) (*ProviderWallet, error) {
	var wallet ProviderWallet
	err := DB.Where("id = ? AND deleted_at IS NULL", id).First(&wallet).Error
	if err != nil {
		return nil, err
	}
	return &wallet, nil
}

func CreateProviderWallet(wallet *ProviderWallet) error {
	return DB.Create(wallet).Error
}

func UpdateProviderWallet(wallet *ProviderWallet) error {
	return DB.Save(wallet).Error
}

func DeleteProviderWallet(id int) error {
	return DB.Delete(&ProviderWallet{}, id).Error
}

// GetEnabledProviderWallets returns all enabled wallets (for the scheduler).
func GetEnabledProviderWallets() ([]*ProviderWallet, error) {
	var wallets []*ProviderWallet
	err := DB.Where("enabled = ? AND deleted_at IS NULL", true).Find(&wallets).Error
	return wallets, err
}

// SaveBalanceUpdate persists only the balance-related fields without touching credentials.
func SaveBalanceUpdate(wallet *ProviderWallet) error {
	return DB.Model(wallet).Updates(map[string]interface{}{
		"last_balance":        wallet.LastBalance,
		"today_start_balance": wallet.TodayStartBalance,
		"today_start_date":    wallet.TodayStartDate,
		"last_checked_at":     wallet.LastCheckedAt,
	}).Error
}
