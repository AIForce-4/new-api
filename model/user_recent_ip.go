package model

import (
	"net"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"gorm.io/gorm"
)

const (
	UserRecentIPEventLogin    = "login"
	UserRecentIPEventRegister = "register"

	InviteAbnormalReasonDuplicateRegistrationIP = "duplicate_registration_ip"
)

type UserRecentIP struct {
	Id        int    `json:"id"`
	UserId    int    `json:"user_id" gorm:"index"`
	IP        string `json:"ip" gorm:"type:varchar(45);column:ip;index"`
	EventType string `json:"event_type" gorm:"type:varchar(16);index"`
	CreatedAt int64  `json:"created_at" gorm:"bigint;index"`
}

func NormalizeClientIP(clientIP string) string {
	clientIP = strings.TrimSpace(clientIP)
	parsedIP := net.ParseIP(clientIP)
	if parsedIP == nil {
		return clientIP
	}
	return parsedIP.String()
}

func RecentIPCollectionLimit() int {
	return operation_setting.GetQuotaSetting().RecentIPLimit
}

func RecentIPExists(clientIP string) (bool, error) {
	if RecentIPCollectionLimit() <= 0 {
		return false, nil
	}
	ip := NormalizeClientIP(clientIP)
	if ip == "" {
		return false, nil
	}
	var count int64
	if err := DB.Model(&UserRecentIP{}).Where("ip = ?", ip).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func DuplicateRegisterIPDisablesInitialQuota(clientIP string) (bool, error) {
	if !operation_setting.GetQuotaSetting().DisableInitialQuotaOnDuplicateRegisterIP {
		return false, nil
	}
	return RecentIPExists(clientIP)
}

func RecordUserRecentIP(userID int, eventType string, clientIP string) error {
	limit := RecentIPCollectionLimit()
	if limit <= 0 || userID == 0 {
		return nil
	}
	return recordUserRecentIPWithDB(DB, userID, eventType, clientIP, limit)
}

func RecordUserRecentIPWithTx(tx *gorm.DB, userID int, eventType string, clientIP string) error {
	limit := RecentIPCollectionLimit()
	if limit <= 0 || userID == 0 {
		return nil
	}
	return recordUserRecentIPWithDB(tx, userID, eventType, clientIP, limit)
}

func recordUserRecentIPWithDB(db *gorm.DB, userID int, eventType string, clientIP string, limit int) error {
	ip := NormalizeClientIP(clientIP)
	if ip == "" {
		return nil
	}
	record := UserRecentIP{
		UserId:    userID,
		IP:        ip,
		EventType: eventType,
		CreatedAt: common.GetTimestamp(),
	}
	if err := db.Create(&record).Error; err != nil {
		return err
	}
	return trimUserRecentIPs(db, userID, limit)
}

func trimUserRecentIPs(db *gorm.DB, userID int, limit int) error {
	var records []UserRecentIP
	if err := db.Select("id").Where("user_id = ?", userID).Order("created_at desc, id desc").Find(&records).Error; err != nil {
		return err
	}
	if len(records) <= limit {
		return nil
	}
	ids := make([]int, 0, len(records)-limit)
	for _, record := range records[limit:] {
		ids = append(ids, record.Id)
	}
	return db.Delete(&UserRecentIP{}, ids).Error
}
