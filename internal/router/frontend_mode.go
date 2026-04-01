package router

import (
	"os"
	"strings"

	"github.com/apache/answer/internal/base/constant"
)

func IsUINextFrontend() bool {
	frontendMode := strings.TrimSpace(os.Getenv(constant.AnswerFrontendEnv))
	return strings.EqualFold(frontendMode, constant.AnswerFrontendUINext)
}
