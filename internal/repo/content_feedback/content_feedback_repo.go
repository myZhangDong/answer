package content_feedback

import (
	"context"
	stdErrors "errors"
	"math"

	"github.com/apache/answer/internal/base/data"
	"github.com/apache/answer/internal/base/reason"
	"github.com/apache/answer/internal/entity"
	"github.com/segmentfault/pacman/errors"
	"xorm.io/xorm"
)

var (
	ErrContentAlreadyLiked  = stdErrors.New("content already liked")
	ErrContentAlreadyRated  = stdErrors.New("content already rated")
)

type ContentFeedbackRepo struct {
	data *data.Data
}

func NewContentFeedbackRepo(data *data.Data) *ContentFeedbackRepo {
	return &ContentFeedbackRepo{data: data}
}

func (r *ContentFeedbackRepo) GetStats(ctx context.Context, objectType string, objectIDs []string) (map[string]*entity.ContentFeedbackStat, error) {
	stats := make(map[string]*entity.ContentFeedbackStat, len(objectIDs))
	if len(objectIDs) == 0 {
		return stats, nil
	}

	list := make([]*entity.ContentFeedbackStat, 0)
	err := r.data.DB.Context(ctx).
		Where("object_type = ?", objectType).
		In("object_id", objectIDs).
		Find(&list)
	if err != nil {
		return nil, errors.InternalServer(reason.DatabaseError).WithError(err).WithStack()
	}
	for _, item := range list {
		stats[item.ObjectID] = item
	}
	return stats, nil
}

func (r *ContentFeedbackRepo) GetViewerRecords(ctx context.Context, objectType string, objectIDs []string, anonTokenHash string) (map[string]*entity.ContentFeedbackRecord, error) {
	records := make(map[string]*entity.ContentFeedbackRecord, len(objectIDs))
	if len(objectIDs) == 0 || anonTokenHash == "" {
		return records, nil
	}

	list := make([]*entity.ContentFeedbackRecord, 0)
	err := r.data.DB.Context(ctx).
		Where("object_type = ? AND anon_token_hash = ?", objectType, anonTokenHash).
		In("object_id", objectIDs).
		Find(&list)
	if err != nil {
		return nil, errors.InternalServer(reason.DatabaseError).WithError(err).WithStack()
	}
	for _, item := range list {
		records[item.ObjectID] = item
	}
	return records, nil
}

func (r *ContentFeedbackRepo) SubmitLike(ctx context.Context, objectType, objectID, anonTokenHash, ipHash, uaHash string) (*entity.ContentFeedbackStat, bool, error) {
	changed := false
	var stat *entity.ContentFeedbackStat
	_, err := r.data.DB.Transaction(func(session *xorm.Session) (any, error) {
		session = session.Context(ctx)
		record := &entity.ContentFeedbackRecord{
			ObjectType:    objectType,
			ObjectID:      objectID,
			AnonTokenHash: anonTokenHash,
		}
		exist, err := session.Where("object_type = ? AND object_id = ? AND anon_token_hash = ?", objectType, objectID, anonTokenHash).
			ForUpdate().
			Get(record)
		if err != nil {
			return nil, err
		}

		if !exist {
			record.Liked = true
			record.LastIPHash = ipHash
			record.LastUAHash = uaHash
			if _, err = session.Insert(record); err != nil {
				return nil, err
			}
			changed = true
		} else if !record.Liked {
			record.Liked = true
			record.LastIPHash = ipHash
			record.LastUAHash = uaHash
			if _, err = session.ID(record.ID).Cols("liked", "last_ip_hash", "last_ua_hash").Update(record); err != nil {
				return nil, err
			}
			changed = true
		} else {
			return nil, ErrContentAlreadyLiked
		}

		stat, err = r.loadOrInitStat(session, objectType, objectID)
		if err != nil {
			return nil, err
		}
		if changed {
			stat.LikeCount++
			if _, err = session.ID(stat.ID).Cols("like_count", "updated_at").Update(stat); err != nil {
				return nil, err
			}
		}
		return nil, nil
	})
	if err != nil {
		if stdErrors.Is(err, ErrContentAlreadyLiked) {
			return nil, false, err
		}
		return nil, false, errors.InternalServer(reason.DatabaseError).WithError(err).WithStack()
	}
	return stat, changed, nil
}

func (r *ContentFeedbackRepo) SubmitRating(ctx context.Context, objectType, objectID, anonTokenHash string, rating float64, ipHash, uaHash string) (*entity.ContentFeedbackStat, bool, error) {
	changed := false
	var stat *entity.ContentFeedbackStat
	_, err := r.data.DB.Transaction(func(session *xorm.Session) (any, error) {
		session = session.Context(ctx)
		record := &entity.ContentFeedbackRecord{
			ObjectType:    objectType,
			ObjectID:      objectID,
			AnonTokenHash: anonTokenHash,
		}
		exist, err := session.Where("object_type = ? AND object_id = ? AND anon_token_hash = ?", objectType, objectID, anonTokenHash).
			ForUpdate().
			Get(record)
		if err != nil {
			return nil, err
		}

		deltaSum := 0.0
		deltaCount := 0
		if !exist {
			record.RatingValue = rating
			record.LastIPHash = ipHash
			record.LastUAHash = uaHash
			if _, err = session.Insert(record); err != nil {
				return nil, err
			}
			deltaSum = rating
			deltaCount = 1
			changed = true
		} else {
			oldRating := record.RatingValue
			if oldRating > 0 {
				return nil, ErrContentAlreadyRated
			}
			record.RatingValue = rating
			record.LastIPHash = ipHash
			record.LastUAHash = uaHash
			if _, err = session.ID(record.ID).Cols("rating_value", "last_ip_hash", "last_ua_hash").Update(record); err != nil {
				return nil, err
			}
			deltaCount = 1
			deltaSum = rating
			changed = true
		}

		stat, err = r.loadOrInitStat(session, objectType, objectID)
		if err != nil {
			return nil, err
		}
		if changed {
			stat.RatingSum += deltaSum
			stat.RatingCount += deltaCount
			if stat.RatingCount < 0 {
				stat.RatingCount = 0
			}
			if stat.RatingCount == 0 {
				stat.RatingSum = 0
				stat.RatingAvg = 0
			} else {
				stat.RatingAvg = math.Round((stat.RatingSum/float64(stat.RatingCount))*10) / 10
			}
			if _, err = session.ID(stat.ID).Cols("rating_sum", "rating_count", "rating_avg", "updated_at").Update(stat); err != nil {
				return nil, err
			}
		}
		return nil, nil
	})
	if err != nil {
		if stdErrors.Is(err, ErrContentAlreadyRated) {
			return nil, false, err
		}
		return nil, false, errors.InternalServer(reason.DatabaseError).WithError(err).WithStack()
	}
	return stat, changed, nil
}

func (r *ContentFeedbackRepo) loadOrInitStat(session *xorm.Session, objectType, objectID string) (*entity.ContentFeedbackStat, error) {
	stat := &entity.ContentFeedbackStat{}
	exist, err := session.Where("object_type = ? AND object_id = ?", objectType, objectID).
		ForUpdate().
		Get(stat)
	if err != nil {
		return nil, err
	}
	if exist {
		return stat, nil
	}

	records := make([]*entity.ContentFeedbackRecord, 0)
	if err = session.Where("object_type = ? AND object_id = ?", objectType, objectID).Find(&records); err != nil {
		return nil, err
	}

	stat.ObjectType = objectType
	stat.ObjectID = objectID
	for _, record := range records {
		if record.Liked {
			stat.LikeCount++
		}
		if record.RatingValue > 0 {
			stat.RatingCount++
			stat.RatingSum += record.RatingValue
		}
	}
	if stat.RatingCount > 0 {
		stat.RatingAvg = math.Round((stat.RatingSum/float64(stat.RatingCount))*10) / 10
	}
	if _, err = session.Insert(stat); err != nil {
		return nil, err
	}
	return stat, nil
}
