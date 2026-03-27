package entity

import "time"

const (
	ContentFeedbackObjectTypeArticle = "article"
	ContentFeedbackObjectTypeVideo   = "video"
	ContentFeedbackObjectTypeProject = "project"
)

// ContentFeedbackStat 匿名互动聚合统计
type ContentFeedbackStat struct {
	ID          int64     `xorm:"not null pk autoincr BIGINT(20) id"`
	ObjectType  string    `xorm:"not null unique(content_feedback_object) VARCHAR(32) object_type"`
	ObjectID    string    `xorm:"not null unique(content_feedback_object) VARCHAR(64) object_id"`
	LikeCount   int       `xorm:"not null default 0 INT(11) like_count"`
	RatingSum   float64   `xorm:"not null default 0 DOUBLE rating_sum"`
	RatingCount int       `xorm:"not null default 0 INT(11) rating_count"`
	RatingAvg   float64   `xorm:"not null default 0 DOUBLE rating_avg"`
	CreatedAt   time.Time `xorm:"created TIMESTAMP created_at"`
	UpdatedAt   time.Time `xorm:"updated TIMESTAMP updated_at"`
}

func (ContentFeedbackStat) TableName() string {
	return "content_feedback_stat"
}

// ContentFeedbackRecord 匿名互动记录
type ContentFeedbackRecord struct {
	ID            int64     `xorm:"not null pk autoincr BIGINT(20) id"`
	ObjectType    string    `xorm:"not null unique(content_feedback_record) index(content_feedback_object_token) VARCHAR(32) object_type"`
	ObjectID      string    `xorm:"not null unique(content_feedback_record) index(content_feedback_object_token) VARCHAR(64) object_id"`
	AnonTokenHash string    `xorm:"not null unique(content_feedback_record) index(content_feedback_object_token) VARCHAR(128) anon_token_hash"`
	Liked         bool      `xorm:"not null default false BOOL liked"`
	RatingValue   float64   `xorm:"not null default 0 DOUBLE rating_value"`
	LastIPHash    string    `xorm:"not null default '' VARCHAR(128) last_ip_hash"`
	LastUAHash    string    `xorm:"not null default '' VARCHAR(128) last_ua_hash"`
	CreatedAt     time.Time `xorm:"created TIMESTAMP created_at"`
	UpdatedAt     time.Time `xorm:"updated TIMESTAMP updated_at"`
}

func (ContentFeedbackRecord) TableName() string {
	return "content_feedback_record"
}
