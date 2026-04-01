package router

import (
	"testing"

	"github.com/apache/answer/internal/base/constant"
)

func TestIsUINextFrontend(t *testing.T) {
	t.Setenv(constant.AnswerFrontendEnv, "")
	if IsUINextFrontend() {
		t.Fatal("empty frontend mode should not enable ui-next routes")
	}

	t.Setenv(constant.AnswerFrontendEnv, constant.AnswerFrontendLegacy)
	if IsUINextFrontend() {
		t.Fatal("legacy frontend mode should not enable ui-next routes")
	}

	t.Setenv(constant.AnswerFrontendEnv, constant.AnswerFrontendUINext)
	if !IsUINextFrontend() {
		t.Fatal("ui-next frontend mode should enable ui-next routes")
	}

	t.Setenv(constant.AnswerFrontendEnv, "UI-NEXT")
	if !IsUINextFrontend() {
		t.Fatal("frontend mode check should be case-insensitive")
	}
}
