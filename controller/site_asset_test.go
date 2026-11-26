package controller

import (
	"bytes"
	"image"
	"image/color"
	"image/png"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"

	"github.com/gin-gonic/gin"
)

func TestValidateHomeNoticeImage(t *testing.T) {
	newPNG := func(width, height int) []byte {
		img := image.NewRGBA(image.Rect(0, 0, width, height))
		img.Set(0, 0, color.White)
		var buffer bytes.Buffer
		if err := png.Encode(&buffer, img); err != nil {
			t.Fatal(err)
		}
		return buffer.Bytes()
	}

	t.Run("accepts valid png", func(t *testing.T) {
		extension, err := validateHomeNoticeImage(newPNG(128, 128))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if extension != "png" {
			t.Fatalf("expected png extension, got %q", extension)
		}
	})

	t.Run("rejects invalid image", func(t *testing.T) {
		if _, err := validateHomeNoticeImage([]byte("not an image")); err == nil {
			t.Fatal("expected invalid image error")
		}
	})

	t.Run("rejects too small image", func(t *testing.T) {
		if _, err := validateHomeNoticeImage(newPNG(32, 32)); err == nil {
			t.Fatal("expected image dimension error")
		}
	})
}

func TestUploadAndGetHomeNoticeImage(t *testing.T) {
	t.Setenv("SITE_ASSET_DIR", t.TempDir())

	img := image.NewRGBA(image.Rect(0, 0, 128, 128))
	img.Set(0, 0, color.White)
	var imageBuffer bytes.Buffer
	if err := png.Encode(&imageBuffer, img); err != nil {
		t.Fatal(err)
	}

	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)
	part, err := writer.CreateFormFile("file", "qr.png")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := part.Write(imageBuffer.Bytes()); err != nil {
		t.Fatal(err)
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}

	uploadRecorder := httptest.NewRecorder()
	uploadContext, _ := gin.CreateTestContext(uploadRecorder)
	uploadContext.Request = httptest.NewRequest(
		http.MethodPost,
		"/api/option/home_notice/image",
		&requestBody,
	)
	uploadContext.Request.Header.Set("Content-Type", writer.FormDataContentType())
	UploadHomeNoticeImage(uploadContext)

	if uploadRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected upload status %d: %s", uploadRecorder.Code, uploadRecorder.Body.String())
	}
	var response struct {
		Success bool `json:"success"`
		Data    struct {
			URL string `json:"url"`
		} `json:"data"`
	}
	if err := common.Unmarshal(uploadRecorder.Body.Bytes(), &response); err != nil {
		t.Fatal(err)
	}
	if !response.Success || !strings.HasPrefix(response.Data.URL, homeNoticeAssetRoutePrefix) {
		t.Fatalf("unexpected upload response: %s", uploadRecorder.Body.String())
	}

	filename := strings.TrimPrefix(response.Data.URL, homeNoticeAssetRoutePrefix)
	if _, err := os.Stat(filepath.Join(homeNoticeAssetDir(), filename)); err != nil {
		t.Fatal(err)
	}

	getRecorder := httptest.NewRecorder()
	getContext, _ := gin.CreateTestContext(getRecorder)
	getContext.Request = httptest.NewRequest(http.MethodGet, response.Data.URL, nil)
	getContext.Params = gin.Params{{Key: "filename", Value: filename}}
	GetHomeNoticeImage(getContext)

	if getRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected image status %d", getRecorder.Code)
	}
	if !bytes.Equal(getRecorder.Body.Bytes(), imageBuffer.Bytes()) {
		t.Fatal("served image does not match uploaded image")
	}
}

func TestDeleteManagedSiteAsset(t *testing.T) {
	assetDir := t.TempDir()
	t.Setenv("SITE_ASSET_DIR", assetDir)

	filename := "group-promo-group-0123456789abcdef.png"
	assetPath := filepath.Join(assetDir, filename)
	if err := os.WriteFile(assetPath, []byte("image"), 0644); err != nil {
		t.Fatal(err)
	}

	if err := deleteManagedSiteAsset(
		homeNoticeAssetRoutePrefix+filename,
		groupPromoGroupImagePrefix,
	); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(assetPath); !os.IsNotExist(err) {
		t.Fatalf("expected old group image to be deleted, stat error: %v", err)
	}

	if err := deleteManagedSiteAsset(
		"/qunPic.jpg",
		groupPromoGroupImagePrefix,
	); err != nil {
		t.Fatal(err)
	}
}
