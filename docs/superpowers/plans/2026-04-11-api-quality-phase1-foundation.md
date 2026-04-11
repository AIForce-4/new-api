# api-quality Phase 1: 基础框架 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建 api-quality 项目基础框架，包括项目结构、数据库模型、基础 CRUD API 和租户认证。

**Architecture:** Go + Gin + GORM 分层架构，支持 SQLite/PostgreSQL 双数据库。模块化设计，handler -> service -> model 三层结构。

**Tech Stack:** Go 1.22+, Gin, GORM v2, JWT, SQLite/PostgreSQL

---

## File Structure

```
api-quality/                          # 新项目根目录（与 new-api 同级）
├── cmd/
│   └── api-quality/
│       └── main.go                   # 入口，CLI 命令
├── internal/
│   ├── config/
│   │   └── config.go                 # 配置加载
│   ├── server/
│   │   ├── server.go                 # HTTP 服务器
│   │   ├── router.go                 # 路由注册
│   │   └── middleware.go             # 中间件
│   ├── handler/
│   │   ├── tenant.go                 # 租户 handler
│   │   ├── provider.go               # 供应商 handler
│   │   └── endpoint.go               # 端点 handler
│   ├── service/
│   │   ├── tenant.go                 # 租户 service
│   │   ├── provider.go               # 供应商 service
│   │   └── endpoint.go               # 端点 service
│   ├── model/
│   │   ├── main.go                   # 数据库初始化
│   │   ├── tenant.go                 # 租户模型
│   │   ├── provider.go               # 供应商模型
│   │   └── endpoint.go               # 端点模型
│   ├── common/
│   │   ├── json.go                   # JSON 工具
│   │   ├── errors.go                 # 错误处理
│   │   └── response.go               # 响应格式
│   └── auth/
│       └── jwt.go                    # JWT 认证
├── config.example.yaml               # 配置示例
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

---

## Task 1: 项目初始化

**Files:**
- Create: `api-quality/go.mod`
- Create: `api-quality/Makefile`
- Create: `api-quality/README.md`
- Create: `api-quality/config.example.yaml`

- [ ] **Step 1: 创建项目目录**

```bash
cd /Users/myc/projects/zhongzhuan
mkdir -p api-quality
cd api-quality
```

- [ ] **Step 2: 初始化 Go 模块**

```bash
go mod init github.com/QuantumNous/api-quality
```

- [ ] **Step 3: 创建 Makefile**

```makefile
.PHONY: build run test clean dev

# 构建
build:
	go build -o bin/api-quality ./cmd/api-quality

# 运行
run: build
	./bin/api-quality serve

# 开发模式
dev:
	go run ./cmd/api-quality serve

# 测试
test:
	go test -v ./...

# 清理
clean:
	rm -rf bin/

# 安装依赖
deps:
	go mod tidy
```

- [ ] **Step 4: 创建配置示例文件**

```yaml
# config.example.yaml
server:
  host: "0.0.0.0"
  port: 8090
  mode: "debug"  # debug | release

database:
  type: "sqlite"  # sqlite | postgres
  sqlite:
    path: "./data/api-quality.db"
  postgres:
    host: "localhost"
    port: 5432
    user: "quality"
    password: ""
    database: "api_quality"
    sslmode: "disable"

jwt:
  secret: "your-secret-key-change-in-production"
  expire_hours: 24

log:
  level: "info"  # debug | info | warn | error
```

- [ ] **Step 5: 创建 README**

```markdown
# api-quality

AI API 质量检测服务

## 快速开始

```bash
# 复制配置
cp config.example.yaml config.yaml

# 运行
make dev
```

## 功能

- 可用性监控
- 真实性验证
- 性能监控
- 计费准确性检测
- 综合评分

## API 文档

启动服务后访问: http://localhost:8090/api/v1
```

- [ ] **Step 6: 创建目录结构**

```bash
mkdir -p cmd/api-quality
mkdir -p internal/{config,server,handler,service,model,common,auth}
mkdir -p data
```

- [ ] **Step 7: 提交**

```bash
git add -A
git commit -m "feat(api-quality): initialize project structure"
```

---

## Task 2: 配置模块

**Files:**
- Create: `api-quality/internal/config/config.go`

- [ ] **Step 1: 安装依赖**

```bash
go get github.com/spf13/viper
go get github.com/gin-gonic/gin
go get gorm.io/gorm
go get gorm.io/driver/sqlite
go get gorm.io/driver/postgres
go get github.com/golang-jwt/jwt/v5
```

- [ ] **Step 2: 创建配置结构和加载逻辑**

```go
// internal/config/config.go
package config

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig   `mapstructure:"server"`
	Database DatabaseConfig `mapstructure:"database"`
	JWT      JWTConfig      `mapstructure:"jwt"`
	Log      LogConfig      `mapstructure:"log"`
}

type ServerConfig struct {
	Host string `mapstructure:"host"`
	Port int    `mapstructure:"port"`
	Mode string `mapstructure:"mode"`
}

type DatabaseConfig struct {
	Type     string         `mapstructure:"type"`
	SQLite   SQLiteConfig   `mapstructure:"sqlite"`
	Postgres PostgresConfig `mapstructure:"postgres"`
}

type SQLiteConfig struct {
	Path string `mapstructure:"path"`
}

type PostgresConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	Database string `mapstructure:"database"`
	SSLMode  string `mapstructure:"sslmode"`
}

type JWTConfig struct {
	Secret      string `mapstructure:"secret"`
	ExpireHours int    `mapstructure:"expire_hours"`
}

type LogConfig struct {
	Level string `mapstructure:"level"`
}

var cfg *Config

func Load(configPath string) (*Config, error) {
	if configPath == "" {
		configPath = "config.yaml"
	}

	viper.SetConfigFile(configPath)
	viper.SetConfigType("yaml")

	// 设置默认值
	viper.SetDefault("server.host", "0.0.0.0")
	viper.SetDefault("server.port", 8090)
	viper.SetDefault("server.mode", "debug")
	viper.SetDefault("database.type", "sqlite")
	viper.SetDefault("database.sqlite.path", "./data/api-quality.db")
	viper.SetDefault("jwt.expire_hours", 24)
	viper.SetDefault("log.level", "info")

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("failed to read config: %w", err)
		}
		// 配置文件不存在时使用默认值
	}

	cfg = &Config{}
	if err := viper.Unmarshal(cfg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	// 确保 SQLite 目录存在
	if cfg.Database.Type == "sqlite" {
		dir := filepath.Dir(cfg.Database.SQLite.Path)
		if err := os.MkdirAll(dir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create data directory: %w", err)
		}
	}

	return cfg, nil
}

func Get() *Config {
	return cfg
}

func (c *DatabaseConfig) PostgresDSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Postgres.Host,
		c.Postgres.Port,
		c.Postgres.User,
		c.Postgres.Password,
		c.Postgres.Database,
		c.Postgres.SSLMode,
	)
}
```

- [ ] **Step 3: 验证编译**

```bash
go build ./internal/config/...
```

- [ ] **Step 4: 提交**

```bash
git add internal/config/config.go go.mod go.sum
git commit -m "feat(api-quality): add config module"
```

---

## Task 3: 公共工具模块

**Files:**
- Create: `api-quality/internal/common/json.go`
- Create: `api-quality/internal/common/errors.go`
- Create: `api-quality/internal/common/response.go`

- [ ] **Step 1: 创建 JSON 工具**

```go
// internal/common/json.go
package common

import (
	"io"

	"github.com/bytedance/sonic"
)

func Marshal(v any) ([]byte, error) {
	return sonic.Marshal(v)
}

func Unmarshal(data []byte, v any) error {
	return sonic.Unmarshal(data, v)
}

func DecodeJSON(reader io.Reader, v any) error {
	return sonic.ConfigDefault.NewDecoder(reader).Decode(v)
}
```

- [ ] **Step 2: 安装 sonic**

```bash
go get github.com/bytedance/sonic
```

- [ ] **Step 3: 创建错误处理**

```go
// internal/common/errors.go
package common

import (
	"fmt"
	"net/http"
)

type APIError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func (e *APIError) Error() string {
	return e.Message
}

var (
	ErrUnauthorized     = &APIError{Code: http.StatusUnauthorized, Message: "unauthorized"}
	ErrForbidden        = &APIError{Code: http.StatusForbidden, Message: "forbidden"}
	ErrNotFound         = &APIError{Code: http.StatusNotFound, Message: "not found"}
	ErrBadRequest       = &APIError{Code: http.StatusBadRequest, Message: "bad request"}
	ErrInternalServer   = &APIError{Code: http.StatusInternalServerError, Message: "internal server error"}
	ErrConflict         = &APIError{Code: http.StatusConflict, Message: "conflict"}
)

func NewAPIError(code int, message string) *APIError {
	return &APIError{Code: code, Message: message}
}

func NewBadRequestError(message string) *APIError {
	return &APIError{Code: http.StatusBadRequest, Message: message}
}

func NewNotFoundError(resource string) *APIError {
	return &APIError{Code: http.StatusNotFound, Message: fmt.Sprintf("%s not found", resource)}
}
```

- [ ] **Step 4: 创建响应格式**

```go
// internal/common/response.go
package common

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Data    any    `json:"data,omitempty"`
}

func Success(c *gin.Context, data any) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Data:    data,
	})
}

func SuccessWithMessage(c *gin.Context, message string) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: message,
	})
}

func Created(c *gin.Context, data any) {
	c.JSON(http.StatusCreated, Response{
		Success: true,
		Data:    data,
	})
}

func Error(c *gin.Context, err error) {
	if apiErr, ok := err.(*APIError); ok {
		c.JSON(apiErr.Code, Response{
			Success: false,
			Message: apiErr.Message,
		})
		return
	}
	c.JSON(http.StatusInternalServerError, Response{
		Success: false,
		Message: err.Error(),
	})
}

func ErrorWithCode(c *gin.Context, code int, message string) {
	c.JSON(code, Response{
		Success: false,
		Message: message,
	})
}
```

- [ ] **Step 5: 验证编译**

```bash
go build ./internal/common/...
```

- [ ] **Step 6: 提交**

```bash
git add internal/common/
git commit -m "feat(api-quality): add common utilities"
```

---

## Task 4: 数据库初始化

**Files:**
- Create: `api-quality/internal/model/main.go`

- [ ] **Step 1: 创建数据库初始化模块**

```go
// internal/model/main.go
package model

import (
	"fmt"
	"log"

	"github.com/QuantumNous/api-quality/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB(cfg *config.Config) error {
	var dialector gorm.Dialector

	switch cfg.Database.Type {
	case "sqlite":
		dialector = sqlite.Open(cfg.Database.SQLite.Path)
	case "postgres":
		dialector = postgres.Open(cfg.Database.PostgresDSN())
	default:
		return fmt.Errorf("unsupported database type: %s", cfg.Database.Type)
	}

	gormConfig := &gorm.Config{}
	if cfg.Server.Mode == "debug" {
		gormConfig.Logger = logger.Default.LogMode(logger.Info)
	} else {
		gormConfig.Logger = logger.Default.LogMode(logger.Warn)
	}

	db, err := gorm.Open(dialector, gormConfig)
	if err != nil {
		return fmt.Errorf("failed to connect database: %w", err)
	}

	DB = db
	log.Printf("Database connected: %s", cfg.Database.Type)

	// 自动迁移
	if err := autoMigrate(); err != nil {
		return fmt.Errorf("failed to auto migrate: %w", err)
	}

	return nil
}

func autoMigrate() error {
	return DB.AutoMigrate(
		&Tenant{},
		&Provider{},
		&Endpoint{},
	)
}

func GetDB() *gorm.DB {
	return DB
}
```

- [ ] **Step 2: 验证编译**

```bash
go build ./internal/model/...
```

- [ ] **Step 3: 提交**

```bash
git add internal/model/main.go
git commit -m "feat(api-quality): add database initialization"
```

---

## Task 5: Tenant 模型

**Files:**
- Create: `api-quality/internal/model/tenant.go`

- [ ] **Step 1: 创建 Tenant 模型**

```go
// internal/model/tenant.go
package model

import (
	"crypto/rand"
	"encoding/hex"
	"time"

	"gorm.io/gorm"
)

type Tenant struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" gorm:"size:100;not null"`
	Email     string         `json:"email" gorm:"size:255;uniqueIndex"`
	Password  string         `json:"-" gorm:"size:255;not null"`
	APIKey    string         `json:"api_key" gorm:"size:64;uniqueIndex"`
	Plan      string         `json:"plan" gorm:"size:50;default:free"`
	Quota     int64          `json:"quota" gorm:"default:1000"`
	UsedQuota int64          `json:"used_quota" gorm:"default:0"`
	Status    int            `json:"status" gorm:"default:1"` // 1: active, 0: disabled
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

func (Tenant) TableName() string {
	return "tenants"
}

func GenerateAPIKey() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return "aq_" + hex.EncodeToString(bytes)
}

// CreateTenant 创建租户
func CreateTenant(tenant *Tenant) error {
	if tenant.APIKey == "" {
		tenant.APIKey = GenerateAPIKey()
	}
	return DB.Create(tenant).Error
}

// GetTenantByID 通过 ID 获取租户
func GetTenantByID(id uint) (*Tenant, error) {
	var tenant Tenant
	err := DB.First(&tenant, id).Error
	if err != nil {
		return nil, err
	}
	return &tenant, nil
}

// GetTenantByEmail 通过邮箱获取租户
func GetTenantByEmail(email string) (*Tenant, error) {
	var tenant Tenant
	err := DB.Where("email = ?", email).First(&tenant).Error
	if err != nil {
		return nil, err
	}
	return &tenant, nil
}

// GetTenantByAPIKey 通过 API Key 获取租户
func GetTenantByAPIKey(apiKey string) (*Tenant, error) {
	var tenant Tenant
	err := DB.Where("api_key = ?", apiKey).First(&tenant).Error
	if err != nil {
		return nil, err
	}
	return &tenant, nil
}

// UpdateTenant 更新租户
func UpdateTenant(tenant *Tenant) error {
	return DB.Save(tenant).Error
}

// DeleteTenant 删除租户
func DeleteTenant(id uint) error {
	return DB.Delete(&Tenant{}, id).Error
}

// ListTenants 获取租户列表
func ListTenants(offset, limit int) ([]Tenant, int64, error) {
	var tenants []Tenant
	var total int64

	DB.Model(&Tenant{}).Count(&total)
	err := DB.Offset(offset).Limit(limit).Find(&tenants).Error
	return tenants, total, err
}

// RegenerateAPIKey 重新生成 API Key
func (t *Tenant) RegenerateAPIKey() error {
	t.APIKey = GenerateAPIKey()
	return DB.Model(t).Update("api_key", t.APIKey).Error
}
```

- [ ] **Step 2: 验证编译**

```bash
go build ./internal/model/...
```

- [ ] **Step 3: 提交**

```bash
git add internal/model/tenant.go
git commit -m "feat(api-quality): add Tenant model"
```

---

## Task 6: Provider 模型

**Files:**
- Create: `api-quality/internal/model/provider.go`

- [ ] **Step 1: 创建 Provider 模型**

```go
// internal/model/provider.go
package model

import (
	"time"

	"gorm.io/gorm"
)

type Provider struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	TenantID  uint           `json:"tenant_id" gorm:"index;not null"`
	Name      string         `json:"name" gorm:"size:100;not null"`
	BaseURL   string         `json:"base_url" gorm:"size:500;not null"`
	APIKey    string         `json:"-" gorm:"size:500"` // 敏感信息不输出
	IsPublic  bool           `json:"is_public" gorm:"default:false"`
	Status    int            `json:"status" gorm:"default:1"` // 1: active, 0: disabled
	Remark    string         `json:"remark" gorm:"size:500"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// 关联
	Tenant    *Tenant    `json:"tenant,omitempty" gorm:"foreignKey:TenantID"`
	Endpoints []Endpoint `json:"endpoints,omitempty" gorm:"foreignKey:ProviderID"`
}

func (Provider) TableName() string {
	return "providers"
}

// CreateProvider 创建供应商
func CreateProvider(provider *Provider) error {
	return DB.Create(provider).Error
}

// GetProviderByID 通过 ID 获取供应商
func GetProviderByID(id uint, tenantID uint) (*Provider, error) {
	var provider Provider
	query := DB.Where("id = ?", id)
	if tenantID > 0 {
		query = query.Where("tenant_id = ? OR is_public = ?", tenantID, true)
	}
	err := query.First(&provider).Error
	if err != nil {
		return nil, err
	}
	return &provider, nil
}

// UpdateProvider 更新供应商
func UpdateProvider(provider *Provider) error {
	return DB.Save(provider).Error
}

// DeleteProvider 删除供应商
func DeleteProvider(id uint, tenantID uint) error {
	return DB.Where("id = ? AND tenant_id = ?", id, tenantID).Delete(&Provider{}).Error
}

// ListProviders 获取供应商列表
func ListProviders(tenantID uint, isPublic *bool, offset, limit int) ([]Provider, int64, error) {
	var providers []Provider
	var total int64

	query := DB.Model(&Provider{})

	if tenantID > 0 {
		if isPublic != nil && *isPublic {
			query = query.Where("is_public = ?", true)
		} else {
			query = query.Where("tenant_id = ? OR is_public = ?", tenantID, true)
		}
	}

	query.Count(&total)
	err := query.Offset(offset).Limit(limit).Find(&providers).Error
	return providers, total, err
}

// GetProviderWithEndpoints 获取供应商及其端点
func GetProviderWithEndpoints(id uint, tenantID uint) (*Provider, error) {
	var provider Provider
	query := DB.Preload("Endpoints").Where("id = ?", id)
	if tenantID > 0 {
		query = query.Where("tenant_id = ? OR is_public = ?", tenantID, true)
	}
	err := query.First(&provider).Error
	if err != nil {
		return nil, err
	}
	return &provider, nil
}
```

- [ ] **Step 2: 验证编译**

```bash
go build ./internal/model/...
```

- [ ] **Step 3: 提交**

```bash
git add internal/model/provider.go
git commit -m "feat(api-quality): add Provider model"
```

---

## Task 7: Endpoint 模型

**Files:**
- Create: `api-quality/internal/model/endpoint.go`

- [ ] **Step 1: 创建 Endpoint 模型**

```go
// internal/model/endpoint.go
package model

import (
	"time"

	"gorm.io/gorm"
)

type EndpointType string

const (
	EndpointTypeChat      EndpointType = "chat"
	EndpointTypeEmbedding EndpointType = "embedding"
	EndpointTypeImage     EndpointType = "image"
	EndpointTypeRerank    EndpointType = "rerank"
)

type Endpoint struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	ProviderID    uint           `json:"provider_id" gorm:"index;not null"`
	ModelName     string         `json:"model_name" gorm:"size:100;not null"`
	EndpointType  EndpointType   `json:"endpoint_type" gorm:"size:50;default:chat"`
	ProbeInterval int            `json:"probe_interval" gorm:"default:60"` // 秒
	Enabled       bool           `json:"enabled" gorm:"default:true"`
	Status        int            `json:"status" gorm:"default:1"` // 1: healthy, 2: degraded, 0: down
	LastProbeAt   *time.Time     `json:"last_probe_at"`
	LastProbeOK   bool           `json:"last_probe_ok" gorm:"default:false"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`

	// 关联
	Provider *Provider `json:"provider,omitempty" gorm:"foreignKey:ProviderID"`
}

func (Endpoint) TableName() string {
	return "endpoints"
}

// CreateEndpoint 创建端点
func CreateEndpoint(endpoint *Endpoint) error {
	return DB.Create(endpoint).Error
}

// GetEndpointByID 通过 ID 获取端点
func GetEndpointByID(id uint) (*Endpoint, error) {
	var endpoint Endpoint
	err := DB.First(&endpoint, id).Error
	if err != nil {
		return nil, err
	}
	return &endpoint, nil
}

// GetEndpointWithProvider 获取端点及其供应商
func GetEndpointWithProvider(id uint) (*Endpoint, error) {
	var endpoint Endpoint
	err := DB.Preload("Provider").First(&endpoint, id).Error
	if err != nil {
		return nil, err
	}
	return &endpoint, nil
}

// UpdateEndpoint 更新端点
func UpdateEndpoint(endpoint *Endpoint) error {
	return DB.Save(endpoint).Error
}

// DeleteEndpoint 删除端点
func DeleteEndpoint(id uint) error {
	return DB.Delete(&Endpoint{}, id).Error
}

// ListEndpointsByProvider 获取供应商的端点列表
func ListEndpointsByProvider(providerID uint) ([]Endpoint, error) {
	var endpoints []Endpoint
	err := DB.Where("provider_id = ?", providerID).Find(&endpoints).Error
	return endpoints, err
}

// ListEnabledEndpoints 获取所有启用的端点（用于探测调度）
func ListEnabledEndpoints() ([]Endpoint, error) {
	var endpoints []Endpoint
	err := DB.Preload("Provider").Where("enabled = ?", true).Find(&endpoints).Error
	return endpoints, err
}

// UpdateProbeStatus 更新探测状态
func (e *Endpoint) UpdateProbeStatus(ok bool, status int) error {
	now := time.Now()
	return DB.Model(e).Updates(map[string]interface{}{
		"last_probe_at": now,
		"last_probe_ok": ok,
		"status":        status,
	}).Error
}
```

- [ ] **Step 2: 验证编译**

```bash
go build ./internal/model/...
```

- [ ] **Step 3: 提交**

```bash
git add internal/model/endpoint.go
git commit -m "feat(api-quality): add Endpoint model"
```

---

## Task 8: JWT 认证模块

**Files:**
- Create: `api-quality/internal/auth/jwt.go`

- [ ] **Step 1: 创建 JWT 模块**

```go
// internal/auth/jwt.go
package auth

import (
	"errors"
	"time"

	"github.com/QuantumNous/api-quality/internal/config"
	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrInvalidToken = errors.New("invalid token")
	ErrExpiredToken = errors.New("token expired")
)

type Claims struct {
	TenantID uint   `json:"tenant_id"`
	Email    string `json:"email"`
	jwt.RegisteredClaims
}

func GenerateToken(tenantID uint, email string) (string, error) {
	cfg := config.Get()
	expireTime := time.Now().Add(time.Duration(cfg.JWT.ExpireHours) * time.Hour)

	claims := &Claims{
		TenantID: tenantID,
		Email:    email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expireTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "api-quality",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(cfg.JWT.Secret))
}

func ParseToken(tokenString string) (*Claims, error) {
	cfg := config.Get()

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return []byte(cfg.JWT.Secret), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, ErrInvalidToken
}
```

- [ ] **Step 2: 验证编译**

```bash
go build ./internal/auth/...
```

- [ ] **Step 3: 提交**

```bash
git add internal/auth/jwt.go
git commit -m "feat(api-quality): add JWT authentication"
```

---

## Task 9: 中间件

**Files:**
- Create: `api-quality/internal/server/middleware.go`

- [ ] **Step 1: 创建中间件**

```go
// internal/server/middleware.go
package server

import (
	"strings"

	"github.com/QuantumNous/api-quality/internal/auth"
	"github.com/QuantumNous/api-quality/internal/common"
	"github.com/QuantumNous/api-quality/internal/model"
	"github.com/gin-gonic/gin"
)

const (
	ContextKeyTenant   = "tenant"
	ContextKeyTenantID = "tenant_id"
)

// JWTAuth JWT 认证中间件
func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			common.Error(c, common.ErrUnauthorized)
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			common.Error(c, common.ErrUnauthorized)
			c.Abort()
			return
		}

		claims, err := auth.ParseToken(parts[1])
		if err != nil {
			common.Error(c, common.ErrUnauthorized)
			c.Abort()
			return
		}

		tenant, err := model.GetTenantByID(claims.TenantID)
		if err != nil || tenant.Status != 1 {
			common.Error(c, common.ErrUnauthorized)
			c.Abort()
			return
		}

		c.Set(ContextKeyTenant, tenant)
		c.Set(ContextKeyTenantID, tenant.ID)
		c.Next()
	}
}

// APIKeyAuth API Key 认证中间件
func APIKeyAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			apiKey = c.Query("api_key")
		}

		if apiKey == "" {
			common.Error(c, common.ErrUnauthorized)
			c.Abort()
			return
		}

		tenant, err := model.GetTenantByAPIKey(apiKey)
		if err != nil || tenant.Status != 1 {
			common.Error(c, common.ErrUnauthorized)
			c.Abort()
			return
		}

		c.Set(ContextKeyTenant, tenant)
		c.Set(ContextKeyTenantID, tenant.ID)
		c.Next()
	}
}

// CORS 跨域中间件
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, X-API-Key")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// GetTenant 从 context 获取租户
func GetTenant(c *gin.Context) *model.Tenant {
	if tenant, exists := c.Get(ContextKeyTenant); exists {
		return tenant.(*model.Tenant)
	}
	return nil
}

// GetTenantID 从 context 获取租户 ID
func GetTenantID(c *gin.Context) uint {
	if id, exists := c.Get(ContextKeyTenantID); exists {
		return id.(uint)
	}
	return 0
}
```

- [ ] **Step 2: 验证编译**

```bash
go build ./internal/server/...
```

- [ ] **Step 3: 提交**

```bash
git add internal/server/middleware.go
git commit -m "feat(api-quality): add authentication middleware"
```

---

## Task 10: Tenant Service

**Files:**
- Create: `api-quality/internal/service/tenant.go`

- [ ] **Step 1: 创建 Tenant Service**

```go
// internal/service/tenant.go
package service

import (
	"errors"

	"github.com/QuantumNous/api-quality/internal/model"
	"golang.org/x/crypto/bcrypt"
)

type TenantService struct{}

func NewTenantService() *TenantService {
	return &TenantService{}
}

type CreateTenantInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type UpdateTenantInput struct {
	Name string `json:"name"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (s *TenantService) Create(input *CreateTenantInput) (*model.Tenant, error) {
	// 检查邮箱是否已存在
	existing, _ := model.GetTenantByEmail(input.Email)
	if existing != nil {
		return nil, errors.New("email already exists")
	}

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	tenant := &model.Tenant{
		Name:     input.Name,
		Email:    input.Email,
		Password: string(hashedPassword),
		APIKey:   model.GenerateAPIKey(),
		Plan:     "free",
		Quota:    1000,
		Status:   1,
	}

	if err := model.CreateTenant(tenant); err != nil {
		return nil, err
	}

	return tenant, nil
}

func (s *TenantService) GetByID(id uint) (*model.Tenant, error) {
	return model.GetTenantByID(id)
}

func (s *TenantService) Update(id uint, input *UpdateTenantInput) (*model.Tenant, error) {
	tenant, err := model.GetTenantByID(id)
	if err != nil {
		return nil, err
	}

	if input.Name != "" {
		tenant.Name = input.Name
	}

	if err := model.UpdateTenant(tenant); err != nil {
		return nil, err
	}

	return tenant, nil
}

func (s *TenantService) Delete(id uint) error {
	return model.DeleteTenant(id)
}

func (s *TenantService) ValidateCredentials(email, password string) (*model.Tenant, error) {
	tenant, err := model.GetTenantByEmail(email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(tenant.Password), []byte(password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	if tenant.Status != 1 {
		return nil, errors.New("account disabled")
	}

	return tenant, nil
}

func (s *TenantService) RegenerateAPIKey(id uint) (*model.Tenant, error) {
	tenant, err := model.GetTenantByID(id)
	if err != nil {
		return nil, err
	}

	if err := tenant.RegenerateAPIKey(); err != nil {
		return nil, err
	}

	return tenant, nil
}
```

- [ ] **Step 2: 安装 bcrypt**

```bash
go get golang.org/x/crypto/bcrypt
```

- [ ] **Step 3: 验证编译**

```bash
go build ./internal/service/...
```

- [ ] **Step 4: 提交**

```bash
git add internal/service/tenant.go go.sum
git commit -m "feat(api-quality): add Tenant service"
```

---

## Task 11: Provider Service

**Files:**
- Create: `api-quality/internal/service/provider.go`

- [ ] **Step 1: 创建 Provider Service**

```go
// internal/service/provider.go
package service

import (
	"github.com/QuantumNous/api-quality/internal/model"
)

type ProviderService struct{}

func NewProviderService() *ProviderService {
	return &ProviderService{}
}

type CreateProviderInput struct {
	Name     string `json:"name" binding:"required"`
	BaseURL  string `json:"base_url" binding:"required,url"`
	APIKey   string `json:"api_key"`
	IsPublic bool   `json:"is_public"`
	Remark   string `json:"remark"`
}

type UpdateProviderInput struct {
	Name     *string `json:"name"`
	BaseURL  *string `json:"base_url"`
	APIKey   *string `json:"api_key"`
	IsPublic *bool   `json:"is_public"`
	Remark   *string `json:"remark"`
	Status   *int    `json:"status"`
}

func (s *ProviderService) Create(tenantID uint, input *CreateProviderInput) (*model.Provider, error) {
	provider := &model.Provider{
		TenantID: tenantID,
		Name:     input.Name,
		BaseURL:  input.BaseURL,
		APIKey:   input.APIKey,
		IsPublic: input.IsPublic,
		Remark:   input.Remark,
		Status:   1,
	}

	if err := model.CreateProvider(provider); err != nil {
		return nil, err
	}

	return provider, nil
}

func (s *ProviderService) GetByID(id uint, tenantID uint) (*model.Provider, error) {
	return model.GetProviderByID(id, tenantID)
}

func (s *ProviderService) GetWithEndpoints(id uint, tenantID uint) (*model.Provider, error) {
	return model.GetProviderWithEndpoints(id, tenantID)
}

func (s *ProviderService) Update(id uint, tenantID uint, input *UpdateProviderInput) (*model.Provider, error) {
	provider, err := model.GetProviderByID(id, tenantID)
	if err != nil {
		return nil, err
	}

	// 只有创建者可以修改
	if provider.TenantID != tenantID {
		return nil, model.ErrForbidden
	}

	if input.Name != nil {
		provider.Name = *input.Name
	}
	if input.BaseURL != nil {
		provider.BaseURL = *input.BaseURL
	}
	if input.APIKey != nil {
		provider.APIKey = *input.APIKey
	}
	if input.IsPublic != nil {
		provider.IsPublic = *input.IsPublic
	}
	if input.Remark != nil {
		provider.Remark = *input.Remark
	}
	if input.Status != nil {
		provider.Status = *input.Status
	}

	if err := model.UpdateProvider(provider); err != nil {
		return nil, err
	}

	return provider, nil
}

func (s *ProviderService) Delete(id uint, tenantID uint) error {
	provider, err := model.GetProviderByID(id, tenantID)
	if err != nil {
		return err
	}

	// 只有创建者可以删除
	if provider.TenantID != tenantID {
		return model.ErrForbidden
	}

	return model.DeleteProvider(id, tenantID)
}

func (s *ProviderService) List(tenantID uint, isPublic *bool, offset, limit int) ([]model.Provider, int64, error) {
	return model.ListProviders(tenantID, isPublic, offset, limit)
}
```

- [ ] **Step 2: 添加错误定义到 model**

```go
// 在 internal/model/main.go 末尾添加
var (
	ErrForbidden = errors.New("forbidden")
	ErrNotFound  = errors.New("not found")
)
```

需要在 model/main.go 顶部添加 import "errors"

- [ ] **Step 3: 验证编译**

```bash
go build ./internal/service/...
```

- [ ] **Step 4: 提交**

```bash
git add internal/service/provider.go internal/model/main.go
git commit -m "feat(api-quality): add Provider service"
```

---

## Task 12: Endpoint Service

**Files:**
- Create: `api-quality/internal/service/endpoint.go`

- [ ] **Step 1: 创建 Endpoint Service**

```go
// internal/service/endpoint.go
package service

import (
	"github.com/QuantumNous/api-quality/internal/model"
)

type EndpointService struct{}

func NewEndpointService() *EndpointService {
	return &EndpointService{}
}

type CreateEndpointInput struct {
	ModelName     string              `json:"model_name" binding:"required"`
	EndpointType  model.EndpointType  `json:"endpoint_type"`
	ProbeInterval int                 `json:"probe_interval"`
	Enabled       *bool               `json:"enabled"`
}

type UpdateEndpointInput struct {
	ModelName     *string             `json:"model_name"`
	EndpointType  *model.EndpointType `json:"endpoint_type"`
	ProbeInterval *int                `json:"probe_interval"`
	Enabled       *bool               `json:"enabled"`
}

func (s *EndpointService) Create(providerID uint, tenantID uint, input *CreateEndpointInput) (*model.Endpoint, error) {
	// 验证供应商归属
	provider, err := model.GetProviderByID(providerID, tenantID)
	if err != nil {
		return nil, err
	}
	if provider.TenantID != tenantID {
		return nil, model.ErrForbidden
	}

	endpoint := &model.Endpoint{
		ProviderID:    providerID,
		ModelName:     input.ModelName,
		EndpointType:  input.EndpointType,
		ProbeInterval: input.ProbeInterval,
		Enabled:       true,
		Status:        1,
	}

	if endpoint.EndpointType == "" {
		endpoint.EndpointType = model.EndpointTypeChat
	}
	if endpoint.ProbeInterval == 0 {
		endpoint.ProbeInterval = 60
	}
	if input.Enabled != nil {
		endpoint.Enabled = *input.Enabled
	}

	if err := model.CreateEndpoint(endpoint); err != nil {
		return nil, err
	}

	return endpoint, nil
}

func (s *EndpointService) GetByID(id uint) (*model.Endpoint, error) {
	return model.GetEndpointByID(id)
}

func (s *EndpointService) GetWithProvider(id uint) (*model.Endpoint, error) {
	return model.GetEndpointWithProvider(id)
}

func (s *EndpointService) Update(id uint, tenantID uint, input *UpdateEndpointInput) (*model.Endpoint, error) {
	endpoint, err := model.GetEndpointWithProvider(id)
	if err != nil {
		return nil, err
	}

	// 验证供应商归属
	if endpoint.Provider.TenantID != tenantID {
		return nil, model.ErrForbidden
	}

	if input.ModelName != nil {
		endpoint.ModelName = *input.ModelName
	}
	if input.EndpointType != nil {
		endpoint.EndpointType = *input.EndpointType
	}
	if input.ProbeInterval != nil {
		endpoint.ProbeInterval = *input.ProbeInterval
	}
	if input.Enabled != nil {
		endpoint.Enabled = *input.Enabled
	}

	if err := model.UpdateEndpoint(endpoint); err != nil {
		return nil, err
	}

	return endpoint, nil
}

func (s *EndpointService) Delete(id uint, tenantID uint) error {
	endpoint, err := model.GetEndpointWithProvider(id)
	if err != nil {
		return err
	}

	// 验证供应商归属
	if endpoint.Provider.TenantID != tenantID {
		return model.ErrForbidden
	}

	return model.DeleteEndpoint(id)
}

func (s *EndpointService) ListByProvider(providerID uint) ([]model.Endpoint, error) {
	return model.ListEndpointsByProvider(providerID)
}
```

- [ ] **Step 2: 验证编译**

```bash
go build ./internal/service/...
```

- [ ] **Step 3: 提交**

```bash
git add internal/service/endpoint.go
git commit -m "feat(api-quality): add Endpoint service"
```

---

## Task 13: Tenant Handler

**Files:**
- Create: `api-quality/internal/handler/tenant.go`

- [ ] **Step 1: 创建 Tenant Handler**

```go
// internal/handler/tenant.go
package handler

import (
	"github.com/QuantumNous/api-quality/internal/auth"
	"github.com/QuantumNous/api-quality/internal/common"
	"github.com/QuantumNous/api-quality/internal/server"
	"github.com/QuantumNous/api-quality/internal/service"
	"github.com/gin-gonic/gin"
)

type TenantHandler struct {
	service *service.TenantService
}

func NewTenantHandler() *TenantHandler {
	return &TenantHandler{
		service: service.NewTenantService(),
	}
}

// Register 注册新租户
func (h *TenantHandler) Register(c *gin.Context) {
	var input service.CreateTenantInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.Error(c, common.NewBadRequestError(err.Error()))
		return
	}

	tenant, err := h.service.Create(&input)
	if err != nil {
		common.Error(c, common.NewBadRequestError(err.Error()))
		return
	}

	// 生成 token
	token, err := auth.GenerateToken(tenant.ID, tenant.Email)
	if err != nil {
		common.Error(c, err)
		return
	}

	common.Created(c, gin.H{
		"tenant": tenant,
		"token":  token,
	})
}

// Login 登录
func (h *TenantHandler) Login(c *gin.Context) {
	var input service.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.Error(c, common.NewBadRequestError(err.Error()))
		return
	}

	tenant, err := h.service.ValidateCredentials(input.Email, input.Password)
	if err != nil {
		common.Error(c, common.ErrUnauthorized)
		return
	}

	token, err := auth.GenerateToken(tenant.ID, tenant.Email)
	if err != nil {
		common.Error(c, err)
		return
	}

	common.Success(c, gin.H{
		"tenant": tenant,
		"token":  token,
	})
}

// GetProfile 获取当前租户信息
func (h *TenantHandler) GetProfile(c *gin.Context) {
	tenant := server.GetTenant(c)
	if tenant == nil {
		common.Error(c, common.ErrUnauthorized)
		return
	}
	common.Success(c, tenant)
}

// UpdateProfile 更新租户信息
func (h *TenantHandler) UpdateProfile(c *gin.Context) {
	tenant := server.GetTenant(c)
	if tenant == nil {
		common.Error(c, common.ErrUnauthorized)
		return
	}

	var input service.UpdateTenantInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.Error(c, common.NewBadRequestError(err.Error()))
		return
	}

	updated, err := h.service.Update(tenant.ID, &input)
	if err != nil {
		common.Error(c, err)
		return
	}

	common.Success(c, updated)
}

// RegenerateAPIKey 重新生成 API Key
func (h *TenantHandler) RegenerateAPIKey(c *gin.Context) {
	tenant := server.GetTenant(c)
	if tenant == nil {
		common.Error(c, common.ErrUnauthorized)
		return
	}

	updated, err := h.service.RegenerateAPIKey(tenant.ID)
	if err != nil {
		common.Error(c, err)
		return
	}

	common.Success(c, gin.H{
		"api_key": updated.APIKey,
	})
}
```

- [ ] **Step 2: 验证编译**

```bash
go build ./internal/handler/...
```

- [ ] **Step 3: 提交**

```bash
git add internal/handler/tenant.go
git commit -m "feat(api-quality): add Tenant handler"
```

---

## Task 14: Provider Handler

**Files:**
- Create: `api-quality/internal/handler/provider.go`

- [ ] **Step 1: 创建 Provider Handler**

```go
// internal/handler/provider.go
package handler

import (
	"strconv"

	"github.com/QuantumNous/api-quality/internal/common"
	"github.com/QuantumNous/api-quality/internal/server"
	"github.com/QuantumNous/api-quality/internal/service"
	"github.com/gin-gonic/gin"
)

type ProviderHandler struct {
	service *service.ProviderService
}

func NewProviderHandler() *ProviderHandler {
	return &ProviderHandler{
		service: service.NewProviderService(),
	}
}

// Create 创建供应商
func (h *ProviderHandler) Create(c *gin.Context) {
	tenantID := server.GetTenantID(c)
	if tenantID == 0 {
		common.Error(c, common.ErrUnauthorized)
		return
	}

	var input service.CreateProviderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.Error(c, common.NewBadRequestError(err.Error()))
		return
	}

	provider, err := h.service.Create(tenantID, &input)
	if err != nil {
		common.Error(c, err)
		return
	}

	common.Created(c, provider)
}

// Get 获取供应商详情
func (h *ProviderHandler) Get(c *gin.Context) {
	tenantID := server.GetTenantID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		common.Error(c, common.NewBadRequestError("invalid id"))
		return
	}

	provider, err := h.service.GetWithEndpoints(uint(id), tenantID)
	if err != nil {
		common.Error(c, common.NewNotFoundError("provider"))
		return
	}

	common.Success(c, provider)
}

// Update 更新供应商
func (h *ProviderHandler) Update(c *gin.Context) {
	tenantID := server.GetTenantID(c)
	if tenantID == 0 {
		common.Error(c, common.ErrUnauthorized)
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		common.Error(c, common.NewBadRequestError("invalid id"))
		return
	}

	var input service.UpdateProviderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.Error(c, common.NewBadRequestError(err.Error()))
		return
	}

	provider, err := h.service.Update(uint(id), tenantID, &input)
	if err != nil {
		common.Error(c, err)
		return
	}

	common.Success(c, provider)
}

// Delete 删除供应商
func (h *ProviderHandler) Delete(c *gin.Context) {
	tenantID := server.GetTenantID(c)
	if tenantID == 0 {
		common.Error(c, common.ErrUnauthorized)
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		common.Error(c, common.NewBadRequestError("invalid id"))
		return
	}

	if err := h.service.Delete(uint(id), tenantID); err != nil {
		common.Error(c, err)
		return
	}

	common.SuccessWithMessage(c, "deleted")
}

// List 获取供应商列表
func (h *ProviderHandler) List(c *gin.Context) {
	tenantID := server.GetTenantID(c)

	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	var isPublic *bool
	if c.Query("is_public") != "" {
		v := c.Query("is_public") == "true"
		isPublic = &v
	}

	providers, total, err := h.service.List(tenantID, isPublic, offset, limit)
	if err != nil {
		common.Error(c, err)
		return
	}

	common.Success(c, gin.H{
		"items": providers,
		"total": total,
	})
}
```

- [ ] **Step 2: 验证编译**

```bash
go build ./internal/handler/...
```

- [ ] **Step 3: 提交**

```bash
git add internal/handler/provider.go
git commit -m "feat(api-quality): add Provider handler"
```

---

## Task 15: Endpoint Handler

**Files:**
- Create: `api-quality/internal/handler/endpoint.go`

- [ ] **Step 1: 创建 Endpoint Handler**

```go
// internal/handler/endpoint.go
package handler

import (
	"strconv"

	"github.com/QuantumNous/api-quality/internal/common"
	"github.com/QuantumNous/api-quality/internal/server"
	"github.com/QuantumNous/api-quality/internal/service"
	"github.com/gin-gonic/gin"
)

type EndpointHandler struct {
	service *service.EndpointService
}

func NewEndpointHandler() *EndpointHandler {
	return &EndpointHandler{
		service: service.NewEndpointService(),
	}
}

// Create 创建端点
func (h *EndpointHandler) Create(c *gin.Context) {
	tenantID := server.GetTenantID(c)
	if tenantID == 0 {
		common.Error(c, common.ErrUnauthorized)
		return
	}

	providerID, err := strconv.ParseUint(c.Param("provider_id"), 10, 32)
	if err != nil {
		common.Error(c, common.NewBadRequestError("invalid provider_id"))
		return
	}

	var input service.CreateEndpointInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.Error(c, common.NewBadRequestError(err.Error()))
		return
	}

	endpoint, err := h.service.Create(uint(providerID), tenantID, &input)
	if err != nil {
		common.Error(c, err)
		return
	}

	common.Created(c, endpoint)
}

// Get 获取端点详情
func (h *EndpointHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		common.Error(c, common.NewBadRequestError("invalid id"))
		return
	}

	endpoint, err := h.service.GetWithProvider(uint(id))
	if err != nil {
		common.Error(c, common.NewNotFoundError("endpoint"))
		return
	}

	common.Success(c, endpoint)
}

// Update 更新端点
func (h *EndpointHandler) Update(c *gin.Context) {
	tenantID := server.GetTenantID(c)
	if tenantID == 0 {
		common.Error(c, common.ErrUnauthorized)
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		common.Error(c, common.NewBadRequestError("invalid id"))
		return
	}

	var input service.UpdateEndpointInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.Error(c, common.NewBadRequestError(err.Error()))
		return
	}

	endpoint, err := h.service.Update(uint(id), tenantID, &input)
	if err != nil {
		common.Error(c, err)
		return
	}

	common.Success(c, endpoint)
}

// Delete 删除端点
func (h *EndpointHandler) Delete(c *gin.Context) {
	tenantID := server.GetTenantID(c)
	if tenantID == 0 {
		common.Error(c, common.ErrUnauthorized)
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		common.Error(c, common.NewBadRequestError("invalid id"))
		return
	}

	if err := h.service.Delete(uint(id), tenantID); err != nil {
		common.Error(c, err)
		return
	}

	common.SuccessWithMessage(c, "deleted")
}

// ListByProvider 获取供应商的端点列表
func (h *EndpointHandler) ListByProvider(c *gin.Context) {
	providerID, err := strconv.ParseUint(c.Param("provider_id"), 10, 32)
	if err != nil {
		common.Error(c, common.NewBadRequestError("invalid provider_id"))
		return
	}

	endpoints, err := h.service.ListByProvider(uint(providerID))
	if err != nil {
		common.Error(c, err)
		return
	}

	common.Success(c, gin.H{
		"items": endpoints,
	})
}
```

- [ ] **Step 2: 验证编译**

```bash
go build ./internal/handler/...
```

- [ ] **Step 3: 提交**

```bash
git add internal/handler/endpoint.go
git commit -m "feat(api-quality): add Endpoint handler"
```

---

## Task 16: 路由注册

**Files:**
- Create: `api-quality/internal/server/router.go`

- [ ] **Step 1: 创建路由注册**

```go
// internal/server/router.go
package server

import (
	"github.com/QuantumNous/api-quality/internal/handler"
	"github.com/gin-gonic/gin"
)

func SetupRouter(r *gin.Engine) {
	// 中间件
	r.Use(CORS())
	r.Use(gin.Recovery())

	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API v1
	v1 := r.Group("/api/v1")
	{
		// 公开接口
		tenantHandler := handler.NewTenantHandler()
		v1.POST("/register", tenantHandler.Register)
		v1.POST("/login", tenantHandler.Login)

		// 需要认证的接口
		authorized := v1.Group("")
		authorized.Use(JWTAuth())
		{
			// 租户
			authorized.GET("/profile", tenantHandler.GetProfile)
			authorized.PUT("/profile", tenantHandler.UpdateProfile)
			authorized.POST("/profile/api-key", tenantHandler.RegenerateAPIKey)

			// 供应商
			providerHandler := handler.NewProviderHandler()
			authorized.POST("/providers", providerHandler.Create)
			authorized.GET("/providers", providerHandler.List)
			authorized.GET("/providers/:id", providerHandler.Get)
			authorized.PUT("/providers/:id", providerHandler.Update)
			authorized.DELETE("/providers/:id", providerHandler.Delete)

			// 端点
			endpointHandler := handler.NewEndpointHandler()
			authorized.POST("/providers/:provider_id/endpoints", endpointHandler.Create)
			authorized.GET("/providers/:provider_id/endpoints", endpointHandler.ListByProvider)
			authorized.GET("/endpoints/:id", endpointHandler.Get)
			authorized.PUT("/endpoints/:id", endpointHandler.Update)
			authorized.DELETE("/endpoints/:id", endpointHandler.Delete)
		}

		// API Key 认证的接口（用于 new-api 集成）
		apiKeyAuth := v1.Group("/external")
		apiKeyAuth.Use(APIKeyAuth())
		{
			providerHandler := handler.NewProviderHandler()
			apiKeyAuth.GET("/providers", providerHandler.List)
			apiKeyAuth.GET("/providers/:id", providerHandler.Get)

			endpointHandler := handler.NewEndpointHandler()
			apiKeyAuth.GET("/endpoints/:id", endpointHandler.Get)
		}
	}
}
```

- [ ] **Step 2: 验证编译**

```bash
go build ./internal/server/...
```

- [ ] **Step 3: 提交**

```bash
git add internal/server/router.go
git commit -m "feat(api-quality): add router setup"
```

---

## Task 17: HTTP 服务器

**Files:**
- Create: `api-quality/internal/server/server.go`

- [ ] **Step 1: 创建 HTTP 服务器**

```go
// internal/server/server.go
package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/QuantumNous/api-quality/internal/config"
	"github.com/gin-gonic/gin"
)

type Server struct {
	cfg    *config.Config
	engine *gin.Engine
	http   *http.Server
}

func New(cfg *config.Config) *Server {
	if cfg.Server.Mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	engine := gin.New()
	engine.Use(gin.Logger())

	SetupRouter(engine)

	return &Server{
		cfg:    cfg,
		engine: engine,
	}
}

func (s *Server) Start() error {
	addr := fmt.Sprintf("%s:%d", s.cfg.Server.Host, s.cfg.Server.Port)

	s.http = &http.Server{
		Addr:         addr,
		Handler:      s.engine,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	go func() {
		log.Printf("Server starting on %s", addr)
		if err := s.http.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// 优雅关闭
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := s.http.Shutdown(ctx); err != nil {
		return fmt.Errorf("server shutdown error: %w", err)
	}

	log.Println("Server stopped")
	return nil
}
```

- [ ] **Step 2: 验证编译**

```bash
go build ./internal/server/...
```

- [ ] **Step 3: 提交**

```bash
git add internal/server/server.go
git commit -m "feat(api-quality): add HTTP server"
```

---

## Task 18: 主入口

**Files:**
- Create: `api-quality/cmd/api-quality/main.go`

- [ ] **Step 1: 创建主入口**

```go
// cmd/api-quality/main.go
package main

import (
	"fmt"
	"log"
	"os"

	"github.com/QuantumNous/api-quality/internal/config"
	"github.com/QuantumNous/api-quality/internal/model"
	"github.com/QuantumNous/api-quality/internal/server"
	"github.com/spf13/cobra"
)

var (
	configPath string
)

func main() {
	rootCmd := &cobra.Command{
		Use:   "api-quality",
		Short: "AI API Quality Detection Service",
	}

	rootCmd.PersistentFlags().StringVarP(&configPath, "config", "c", "config.yaml", "config file path")

	serveCmd := &cobra.Command{
		Use:   "serve",
		Short: "Start the API server",
		Run:   runServe,
	}

	rootCmd.AddCommand(serveCmd)

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func runServe(cmd *cobra.Command, args []string) {
	// 加载配置
	cfg, err := config.Load(configPath)
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 初始化数据库
	if err := model.InitDB(cfg); err != nil {
		log.Fatalf("Failed to init database: %v", err)
	}

	// 启动服务器
	srv := server.New(cfg)
	if err := srv.Start(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
```

- [ ] **Step 2: 安装 cobra**

```bash
go get github.com/spf13/cobra
```

- [ ] **Step 3: 整理依赖**

```bash
go mod tidy
```

- [ ] **Step 4: 验证构建**

```bash
go build -o bin/api-quality ./cmd/api-quality
```

- [ ] **Step 5: 复制配置并测试启动**

```bash
cp config.example.yaml config.yaml
./bin/api-quality serve
```

预期输出:
```
Database connected: sqlite
Server starting on 0.0.0.0:8090
```

- [ ] **Step 6: 测试 API**

```bash
# 健康检查
curl http://localhost:8090/health

# 注册租户
curl -X POST http://localhost:8090/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'

# 登录
curl -X POST http://localhost:8090/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

- [ ] **Step 7: 提交**

```bash
git add cmd/api-quality/main.go go.mod go.sum
git commit -m "feat(api-quality): add main entry point

Phase 1 complete: basic framework with tenant/provider/endpoint CRUD"
```

---

## Summary

Phase 1 完成后，api-quality 将具备：

1. **项目结构**: 完整的 Go 项目结构，支持 SQLite/PostgreSQL
2. **数据模型**: Tenant, Provider, Endpoint 三个核心模型
3. **认证系统**: JWT Token 认证 + API Key 认证
4. **基础 API**:
   - 租户注册、登录、profile 管理
   - 供应商 CRUD
   - 端点 CRUD
5. **中间件**: CORS, 认证, 错误处理

**下一阶段**: Phase 2 探测引擎（可用性探测、性能探测、调度器）
