package schema

type ContentFeedbackReq struct {
	ObjectType string `validate:"required,oneof=article video project" form:"object_type" json:"object_type"`
	ObjectID   string `validate:"required" form:"object_id" json:"object_id"`
}

type ContentFeedbackBatchReq struct {
	ObjectType string   `validate:"required,oneof=article video project" json:"object_type"`
	ObjectIDs  []string `validate:"required" json:"object_ids"`
}

type ContentFeedbackRatingReq struct {
	ObjectType string  `validate:"required,oneof=article video project" json:"object_type"`
	ObjectID   string  `validate:"required" json:"object_id"`
	Rating     float64 `validate:"required,gte=1,lte=5" json:"rating"`
}

type ContentFeedbackResp struct {
	ObjectType  string  `json:"object_type"`
	ObjectID    string  `json:"object_id"`
	LikeCount   int     `json:"like_count"`
	RatingAvg   float64 `json:"rating_avg"`
	RatingCount int     `json:"rating_count"`
	LikedByMe   bool    `json:"liked_by_me"`
	RatedByMe   bool    `json:"rated_by_me"`
	MyRating    float64 `json:"my_rating"`
}
