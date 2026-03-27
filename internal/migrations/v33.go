package migrations

import (
	"context"

	"github.com/apache/answer/internal/entity"
	"xorm.io/xorm"
)

func addContentFeedbackTables(ctx context.Context, x *xorm.Engine) error {
	return x.Context(ctx).Sync(
		new(entity.ContentFeedbackStat),
		new(entity.ContentFeedbackRecord),
	)
}
