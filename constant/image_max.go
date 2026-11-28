package constant

import "strings"

const (
	ImageMaxRoute = "/image-max"
	ImageMaxPath  = "/pg" + ImageMaxRoute
	ImageMaxModel = "doubao-seedream-5-5-261028"
	ImageMaxName  = "生图Max"
)

func IsImageMaxModel(name string) bool {
	return strings.EqualFold(strings.TrimSpace(name), ImageMaxModel) || strings.EqualFold(strings.TrimSpace(name), ImageMaxName)
}
