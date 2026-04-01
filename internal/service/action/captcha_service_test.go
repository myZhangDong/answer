package action

import (
	"context"
	"testing"

	"github.com/apache/answer/internal/entity"
	"github.com/apache/answer/internal/schema"
	"github.com/stretchr/testify/require"
)

type testCaptchaRepo struct {
	captchas map[string]string
	actions  map[string]*entity.ActionRecordInfo
}

func newTestCaptchaRepo() *testCaptchaRepo {
	return &testCaptchaRepo{
		captchas: make(map[string]string),
		actions:  make(map[string]*entity.ActionRecordInfo),
	}
}

func (r *testCaptchaRepo) SetCaptcha(_ context.Context, key, captcha string) error {
	r.captchas[key] = captcha
	return nil
}

func (r *testCaptchaRepo) GetCaptcha(_ context.Context, key string) (string, error) {
	value, ok := r.captchas[key]
	if !ok {
		return "", context.Canceled
	}
	return value, nil
}

func (r *testCaptchaRepo) DelCaptcha(_ context.Context, key string) error {
	delete(r.captchas, key)
	return nil
}

func (r *testCaptchaRepo) SetActionType(_ context.Context, unit, actionType, _ string, amount int) error {
	r.actions[unit+"@"+actionType] = &entity.ActionRecordInfo{Num: amount}
	return nil
}

func (r *testCaptchaRepo) GetActionType(_ context.Context, unit, actionType string) (*entity.ActionRecordInfo, error) {
	return r.actions[unit+"@"+actionType], nil
}

func (r *testCaptchaRepo) DelActionType(_ context.Context, unit, actionType string) error {
	delete(r.actions, unit+"@"+actionType)
	return nil
}

func TestCaptchaServiceDemoFormGenerateAndVerify(t *testing.T) {
	repo := newTestCaptchaRepo()
	service := NewCaptchaService(repo)

	resp, err := service.ActionRecord(context.Background(), &schema.ActionRecordReq{
		Action: entity.CaptchaActionDemoForm,
		IP:     "127.0.0.1",
	})
	require.NoError(t, err)
	require.True(t, resp.Verify)
	require.NotEmpty(t, resp.CaptchaID)
	require.Contains(t, resp.CaptchaImg, "data:image/png;base64,")

	answer := repo.captchas[resp.CaptchaID]
	require.NotEmpty(t, answer)
	require.True(t, service.ActionRecordVerifyCaptcha(context.Background(), entity.CaptchaActionDemoForm, "127.0.0.1", resp.CaptchaID, answer))
}

func TestCaptchaServiceDemoFormRequiresCaptchaWithoutPlugin(t *testing.T) {
	repo := newTestCaptchaRepo()
	service := NewCaptchaService(repo)

	resp, err := service.ActionRecord(context.Background(), &schema.ActionRecordReq{
		Action: entity.CaptchaActionPassword,
		IP:     "127.0.0.1",
	})
	require.NoError(t, err)
	require.False(t, resp.Verify)

	require.False(t, service.ActionRecordVerifyCaptcha(context.Background(), entity.CaptchaActionDemoForm, "127.0.0.1", "missing", "1234"))
}
