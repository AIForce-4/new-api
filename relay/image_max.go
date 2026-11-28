package relay

import (
	"bytes"
	"encoding/base64"
	"errors"
	"io"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"
)

func writeImageMaxResponse(c *gin.Context, resp *http.Response, request *dto.ImageRequest) (*dto.Usage, *types.NewAPIError) {
	invalid := func() (*dto.Usage, *types.NewAPIError) {
		return nil, types.NewErrorWithStatusCode(errors.New("生图Max未返回有效图片"),
			types.ErrorCodeBadResponseBody, http.StatusBadGateway, types.ErrOptionWithSkipRetry())
	}
	if resp == nil || resp.Body == nil {
		return invalid()
	}
	defer resp.Body.Close()
	var result struct {
		Data []struct {
			Image string `json:"b64_json"`
			Error any    `json:"error"`
		} `json:"data"`
		Usage struct {
			GeneratedImages *int `json:"generated_images"`
		} `json:"usage"`
		Error any `json:"error"`
	}
	if err := common.DecodeJson(io.LimitReader(resp.Body, 48<<20), &result); err != nil || result.Error != nil ||
		len(result.Data) != 1 || result.Data[0].Error != nil ||
		(result.Usage.GeneratedImages != nil && *result.Usage.GeneratedImages != 1) {
		return invalid()
	}
	picture := result.Data[0].Image
	var header [8]byte
	if _, err := io.ReadFull(base64.NewDecoder(base64.StdEncoding, strings.NewReader(picture)), header[:]); err != nil {
		return invalid()
	}
	format := common.JsonRawMessageToString(request.OutputFormat)
	if !((format == "png" && string(header[:]) == "\x89PNG\r\n\x1a\n") ||
		(format == "jpeg" && bytes.HasPrefix(header[:], []byte{0xff, 0xd8, 0xff}))) {
		return invalid()
	}
	c.JSON(http.StatusOK, gin.H{"data": []gin.H{{"b64_json": picture}}})
	return &dto.Usage{PromptTokens: 1, TotalTokens: 1}, nil
}
