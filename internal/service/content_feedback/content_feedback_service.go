package content_feedback

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	stdErrors "errors"
	"math"
	"strings"

	"github.com/apache/answer/internal/base/reason"
	"github.com/apache/answer/internal/entity"
	feedbackrepo "github.com/apache/answer/internal/repo/content_feedback"
	"github.com/apache/answer/internal/schema"
	projectcommon "github.com/apache/answer/internal/service/project_common"
	questioncommon "github.com/apache/answer/internal/service/question_common"
	videocommon "github.com/apache/answer/internal/service/video_common"
	"github.com/apache/answer/pkg/token"
	"github.com/apache/answer/pkg/uid"
	"github.com/segmentfault/pacman/errors"
)

type ContentFeedbackService struct {
	repo         *feedbackrepo.ContentFeedbackRepo
	questionRepo questioncommon.QuestionRepo
	videoRepo    videocommon.VideoRepo
	projectRepo  projectcommon.ProjectRepo
}

func NewContentFeedbackService(
	repo *feedbackrepo.ContentFeedbackRepo,
	questionRepo questioncommon.QuestionRepo,
	videoRepo videocommon.VideoRepo,
	projectRepo projectcommon.ProjectRepo,
) *ContentFeedbackService {
	return &ContentFeedbackService{
		repo:         repo,
		questionRepo: questionRepo,
		videoRepo:    videoRepo,
		projectRepo:  projectRepo,
	}
}

func (s *ContentFeedbackService) GetFeedback(ctx context.Context, req *schema.ContentFeedbackReq, anonToken string) (*schema.ContentFeedbackResp, error) {
	objectID, err := s.ensurePublicObject(ctx, req.ObjectType, req.ObjectID)
	if err != nil {
		return nil, err
	}
	stats, err := s.repo.GetStats(ctx, req.ObjectType, []string{objectID})
	if err != nil {
		return nil, err
	}
	record, err := s.getViewerRecordByToken(ctx, req.ObjectType, objectID, anonToken)
	if err != nil {
		return nil, err
	}
	return s.toResp(req.ObjectType, req.ObjectID, stats[objectID], record), nil
}

func (s *ContentFeedbackService) GetFeedbackBatch(ctx context.Context, req *schema.ContentFeedbackBatchReq, anonToken string) ([]*schema.ContentFeedbackResp, error) {
	if len(req.ObjectIDs) == 0 {
		return nil, errors.BadRequest(reason.RequestFormatError)
	}
	if len(req.ObjectIDs) > 200 {
		return nil, errors.BadRequest(reason.RequestFormatError).WithMsg("object_ids 数量不能超过 200")
	}

	normalized := make([]string, 0, len(req.ObjectIDs))
	seen := make(map[string]struct{}, len(req.ObjectIDs))
	idMapping := make(map[string]string, len(req.ObjectIDs))
	for _, objectID := range req.ObjectIDs {
		if strings.TrimSpace(objectID) == "" {
			continue
		}
		longID := uid.DeShortID(objectID)
		if _, ok := seen[longID]; ok {
			continue
		}
		seen[longID] = struct{}{}
		normalized = append(normalized, longID)
		idMapping[longID] = objectID
	}

	stats, err := s.repo.GetStats(ctx, req.ObjectType, normalized)
	if err != nil {
		return nil, err
	}
	records, err := s.getViewerRecordsByToken(ctx, req.ObjectType, normalized, anonToken)
	if err != nil {
		return nil, err
	}

	resp := make([]*schema.ContentFeedbackResp, 0, len(normalized))
	for _, objectID := range normalized {
		resp = append(resp, s.toResp(req.ObjectType, idMapping[objectID], stats[objectID], records[objectID]))
	}
	return resp, nil
}

func (s *ContentFeedbackService) SubmitLike(ctx context.Context, req *schema.ContentFeedbackReq, anonToken, ip, userAgent string) (resp *schema.ContentFeedbackResp, finalToken string, tokenCreated bool, err error) {
	objectID, err := s.ensurePublicObject(ctx, req.ObjectType, req.ObjectID)
	if err != nil {
		return nil, "", false, err
	}
	finalToken, tokenCreated = s.ensureAnonToken(anonToken)
	stat, _, err := s.repo.SubmitLike(ctx, req.ObjectType, objectID, hashString(finalToken), hashString(ip), hashString(userAgent))
	if err != nil {
		if stdErrors.Is(err, feedbackrepo.ErrContentAlreadyLiked) {
			return nil, "", false, errors.BadRequest(reason.RequestFormatError).WithMsg("您已经点过赞了")
		}
		return nil, "", false, err
	}
	record, err := s.getViewerRecordByToken(ctx, req.ObjectType, objectID, finalToken)
	if err != nil {
		return nil, "", false, err
	}
	return s.toResp(req.ObjectType, req.ObjectID, stat, record), finalToken, tokenCreated, nil
}

func (s *ContentFeedbackService) SubmitRating(ctx context.Context, req *schema.ContentFeedbackRatingReq, anonToken, ip, userAgent string) (resp *schema.ContentFeedbackResp, finalToken string, tokenCreated bool, err error) {
	if !isHalfStarRating(req.Rating) {
		return nil, "", false, errors.BadRequest(reason.RequestFormatError).WithMsg("rating 只支持 0.5 步长，范围 1 到 5")
	}
	objectID, err := s.ensurePublicObject(ctx, req.ObjectType, req.ObjectID)
	if err != nil {
		return nil, "", false, err
	}
	finalToken, tokenCreated = s.ensureAnonToken(anonToken)
	stat, _, err := s.repo.SubmitRating(ctx, req.ObjectType, objectID, hashString(finalToken), req.Rating, hashString(ip), hashString(userAgent))
	if err != nil {
		if stdErrors.Is(err, feedbackrepo.ErrContentAlreadyRated) {
			return nil, "", false, errors.BadRequest(reason.RequestFormatError).WithMsg("您已经评过分了")
		}
		return nil, "", false, err
	}
	record, err := s.getViewerRecordByToken(ctx, req.ObjectType, objectID, finalToken)
	if err != nil {
		return nil, "", false, err
	}
	return s.toResp(req.ObjectType, req.ObjectID, stat, record), finalToken, tokenCreated, nil
}

func (s *ContentFeedbackService) ensurePublicObject(ctx context.Context, objectType, objectID string) (string, error) {
	switch objectType {
	case entity.ContentFeedbackObjectTypeArticle:
		question, exist, err := s.questionRepo.GetQuestion(ctx, objectID)
		if err != nil {
			return "", err
		}
		if !exist || question.Type != entity.ContentTypeArticle || question.Status != entity.QuestionStatusAvailable || question.Show != entity.QuestionShow {
			return "", errors.BadRequest(reason.QuestionNotFound)
		}
		return uid.DeShortID(question.ID), nil
	case entity.ContentFeedbackObjectTypeVideo:
		video, exist, err := s.videoRepo.GetVideo(ctx, objectID)
		if err != nil {
			return "", err
		}
		if !exist || video.Status != entity.VideoStatusAvailable || video.IsShow != entity.VideoShow {
			return "", errors.BadRequest(reason.ObjectNotFound)
		}
		return uid.DeShortID(video.ID), nil
	case entity.ContentFeedbackObjectTypeProject:
		project, exist, err := s.projectRepo.GetProject(ctx, objectID)
		if err != nil {
			return "", err
		}
		if !exist || project.Status != entity.ProjectStatusAvailable {
			return "", errors.BadRequest(reason.ObjectNotFound)
		}
		return uid.DeShortID(project.ID), nil
	default:
		return "", errors.BadRequest(reason.RequestFormatError)
	}
}

func (s *ContentFeedbackService) toResp(objectType, objectID string, stat *entity.ContentFeedbackStat, record *entity.ContentFeedbackRecord) *schema.ContentFeedbackResp {
	resp := &schema.ContentFeedbackResp{
		ObjectType: objectType,
		ObjectID:   objectID,
	}
	if stat == nil {
		return s.attachViewerState(resp, record)
	}
	resp.LikeCount = stat.LikeCount
	resp.RatingAvg = stat.RatingAvg
	resp.RatingCount = stat.RatingCount
	return s.attachViewerState(resp, record)
}

func (s *ContentFeedbackService) attachViewerState(resp *schema.ContentFeedbackResp, record *entity.ContentFeedbackRecord) *schema.ContentFeedbackResp {
	if record == nil {
		return resp
	}
	resp.LikedByMe = record.Liked
	resp.RatedByMe = record.RatingValue > 0
	resp.MyRating = record.RatingValue
	return resp
}

func (s *ContentFeedbackService) ensureAnonToken(current string) (string, bool) {
	if strings.TrimSpace(current) != "" {
		return current, false
	}
	return token.GenerateToken(), true
}

func (s *ContentFeedbackService) getViewerRecordByToken(ctx context.Context, objectType, objectID, anonToken string) (*entity.ContentFeedbackRecord, error) {
	records, err := s.getViewerRecordsByToken(ctx, objectType, []string{objectID}, anonToken)
	if err != nil {
		return nil, err
	}
	return records[objectID], nil
}

func (s *ContentFeedbackService) getViewerRecordsByToken(ctx context.Context, objectType string, objectIDs []string, anonToken string) (map[string]*entity.ContentFeedbackRecord, error) {
	if strings.TrimSpace(anonToken) == "" {
		return map[string]*entity.ContentFeedbackRecord{}, nil
	}
	return s.repo.GetViewerRecords(ctx, objectType, objectIDs, hashString(anonToken))
}

func hashString(value string) string {
	sum := sha256.Sum256([]byte(strings.TrimSpace(value)))
	return hex.EncodeToString(sum[:])
}

func isHalfStarRating(value float64) bool {
	scaled := value * 2
	return math.Abs(scaled-math.Round(scaled)) < 0.0001
}
