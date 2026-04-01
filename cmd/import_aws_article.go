package answercmd

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"
	"unicode"

	"github.com/apache/answer/internal/base/conf"
	"github.com/apache/answer/internal/base/constant"
	"github.com/apache/answer/internal/base/data"
	"github.com/apache/answer/internal/cli"
	"github.com/apache/answer/internal/entity"
	"github.com/apache/answer/pkg/converter"
	"github.com/spf13/cobra"
	"xorm.io/xorm"
	"xorm.io/xorm/names"
)

var (
	awsArticleSourceDSN     string
	awsArticleLimit         int
	awsArticleTargetUserID  string
	awsArticleIncludeDelete bool
	awsArticleSourceUserIDs []string
	awsArticleMinViews      int
)

func init() {
	importAWSArticleCmd.Flags().StringVar(&awsArticleSourceDSN, "source-dsn", "", "源库 MySQL DSN，例如 root:pass@tcp(host:3306)/db")
	importAWSArticleCmd.Flags().IntVar(&awsArticleLimit, "limit", 2, "导入文章数量；传 0 表示不限制")
	importAWSArticleCmd.Flags().StringVar(&awsArticleTargetUserID, "target-user-id", "", "本地目标用户 ID；为空时自动选择第一个管理员")
	importAWSArticleCmd.Flags().BoolVar(&awsArticleIncludeDelete, "include-deleted", false, "是否包含已删除文章")
	importAWSArticleCmd.Flags().StringSliceVar(&awsArticleSourceUserIDs, "source-user-id", nil, "只迁移指定旧站用户 ID，可重复传入或用逗号分隔")
	importAWSArticleCmd.Flags().IntVar(&awsArticleMinViews, "min-views", 0, "只迁移浏览量大于等于该值的文章")
	rootCmd.AddCommand(importAWSArticleCmd)
}

var importAWSArticleCmd = &cobra.Command{
	Use:   "import-aws-article",
	Short: "导入 aws_article 到本地 Answer",
	Long:  "从旧库 aws_article/aws_users/aws_category 读取文章，并导入到当前 Answer 的文章模型(question(type=2))。",
	Run: func(_ *cobra.Command, _ []string) {
		cli.FormatAllPath(dataDirPath)
		if strings.TrimSpace(awsArticleSourceDSN) == "" {
			fmt.Println("缺少 --source-dsn")
			return
		}
		if awsArticleLimit < 0 {
			fmt.Println("--limit 不能小于 0")
			return
		}
		if awsArticleMinViews < 0 {
			fmt.Println("--min-views 不能小于 0")
			return
		}

		cfg, err := conf.ReadConfig(cli.GetConfigFilePath())
		if err != nil {
			fmt.Println("读取本地配置失败:", err.Error())
			return
		}

		targetDB, err := data.NewDB(cfg.Debug, cfg.Data.Database)
		if err != nil {
			fmt.Println("连接本地目标库失败:", err.Error())
			return
		}
		defer targetDB.Close()

		sourceDB, err := xorm.NewEngine("mysql", normalizeMySQLDSN(awsArticleSourceDSN))
		if err != nil {
			fmt.Println("连接源库失败:", err.Error())
			return
		}
		sourceDB.SetColumnMapper(names.GonicMapper{})
		if err = sourceDB.Ping(); err != nil {
			fmt.Println("连接源库失败:", err.Error())
			return
		}
		defer sourceDB.Close()

		sourceUserIDs, err := parseSourceUserIDs(awsArticleSourceUserIDs)
		if err != nil {
			fmt.Println("解析 --source-user-id 失败:", err.Error())
			return
		}

		importer := &awsArticleImporter{
			sourceDB: sourceDB,
			targetDB: targetDB,
		}

		summary, err := importer.ImportLatest(context.Background(), awsArticleImportOptions{
			Limit:          awsArticleLimit,
			TargetUserID:   strings.TrimSpace(awsArticleTargetUserID),
			IncludeDeleted: awsArticleIncludeDelete,
			SourceUserIDs:  sourceUserIDs,
			MinViews:       awsArticleMinViews,
		})
		if err != nil {
			fmt.Println("导入失败:", err.Error())
			return
		}

		fmt.Printf("导入完成：请求 %d 篇，成功 %d 篇，跳过 %d 篇\n", summary.Requested, summary.Imported, summary.Skipped)
		for _, item := range summary.Results {
			fmt.Printf("- 源文章 %d => 目标文章 %s [%s] %s\n", item.SourceArticleID, item.TargetQuestionID, item.Status, item.Title)
		}
	},
}

type awsArticleImportOptions struct {
	Limit          int
	TargetUserID   string
	IncludeDeleted bool
	SourceUserIDs  []int64
	MinViews       int
}

type awsArticleImportSummary struct {
	Requested int
	Imported  int
	Skipped   int
	Results   []awsArticleImportResult
}

type awsArticleImportResult struct {
	SourceArticleID  int64
	TargetQuestionID string
	Status           string
	Title            string
}

type awsArticleImporter struct {
	sourceDB *xorm.Engine
	targetDB *xorm.Engine
}

type awsArticleSourceRow struct {
	ID         int64  `xorm:"id"`
	Title      string `xorm:"title"`
	Message    string `xorm:"message"`
	UID        int64  `xorm:"uid"`
	AddTime    int64  `xorm:"add_time"`
	Views      int    `xorm:"views"`
	Comments   int    `xorm:"comments"`
	IsStick    int    `xorm:"is_stick"`
	SetTop     int    `xorm:"set_top"`
	IsDel      int    `xorm:"is_del"`
	CategoryID int64  `xorm:"category_id"`

	UserName      string `xorm:"-"`
	CategoryTitle string `xorm:"-"`
	CategorySlug  string `xorm:"-"`
}

type awsUserSourceRow struct {
	UID      int64  `xorm:"uid"`
	UserName string `xorm:"user_name"`
}

type awsCategorySourceByIDRow struct {
	ID       int64  `xorm:"id"`
	Title    string `xorm:"title"`
	URLToken string `xorm:"url_token"`
}

type awsCategorySourceByCategoryIDRow struct {
	CategoryID int64  `xorm:"category_id"`
	Title      string `xorm:"title"`
	URLToken   string `xorm:"url_token"`
}

type awsArticleImportRecord struct {
	ID               int64     `xorm:"not null pk autoincr BIGINT(20) id"`
	CreatedAt        time.Time `xorm:"created TIMESTAMP created_at"`
	UpdatedAt        time.Time `xorm:"updated TIMESTAMP updated_at"`
	SourceArticleID  int64     `xorm:"not null unique BIGINT(20) source_article_id"`
	SourceUID        int64     `xorm:"not null default 0 BIGINT(20) source_uid"`
	SourceCategoryID int64     `xorm:"not null default 0 BIGINT(20) source_category_id"`
	SourceAddTime    int64     `xorm:"not null default 0 BIGINT(20) source_add_time"`
	SourceTitle      string    `xorm:"not null default '' VARCHAR(255) source_title"`
	TargetQuestionID string    `xorm:"not null default 0 BIGINT(20) target_question_id"`
	TargetUserID     string    `xorm:"not null default 0 BIGINT(20) target_user_id"`
}

func (awsArticleImportRecord) TableName() string {
	return "aws_article_import_record"
}

func (ai *awsArticleImporter) ImportLatest(ctx context.Context, opts awsArticleImportOptions) (*awsArticleImportSummary, error) {
	if err := ai.targetDB.Sync2(new(awsArticleImportRecord)); err != nil {
		return nil, err
	}

	targetUserID, err := ai.resolveTargetUserID(ctx, opts.TargetUserID)
	if err != nil {
		return nil, err
	}

	articles, err := ai.fetchLatestArticles(ctx, opts.Limit, opts.IncludeDeleted)
	if err != nil {
		return nil, err
	}

	summary := &awsArticleImportSummary{
		Requested: len(articles),
		Results:   make([]awsArticleImportResult, 0, len(articles)),
	}

	for _, article := range articles {
		result, err := ai.importOne(ctx, article, targetUserID)
		if err != nil {
			return summary, fmt.Errorf("源文章 %d 导入失败: %w", article.ID, err)
		}
		summary.Results = append(summary.Results, result)
		if result.Status == "imported" {
			summary.Imported++
		} else {
			summary.Skipped++
		}
	}

	return summary, nil
}

func (ai *awsArticleImporter) resolveTargetUserID(ctx context.Context, targetUserID string) (string, error) {
	if targetUserID != "" {
		user := &entity.User{}
		exist, err := ai.targetDB.Context(ctx).ID(targetUserID).Get(user)
		if err != nil {
			return "", err
		}
		if !exist {
			return "", fmt.Errorf("目标用户 %s 不存在", targetUserID)
		}
		return targetUserID, nil
	}

	type targetUserRow struct {
		ID string `xorm:"id"`
	}

	row := &targetUserRow{}
	exist, err := ai.targetDB.Context(ctx).
		Table("user").
		Alias("u").
		Join("INNER", "user_role_rel", "u.id = user_role_rel.user_id AND user_role_rel.role_id = 2").
		Where("u.status = ?", entity.UserStatusAvailable).
		Cols("u.id").
		Asc("u.id").
		Get(row)
	if err != nil {
		return "", err
	}
	if !exist {
		return "", fmt.Errorf("未找到可用管理员，请用 --target-user-id 指定导入归属用户")
	}
	return row.ID, nil
}

func (ai *awsArticleImporter) fetchLatestArticles(ctx context.Context, limit int, includeDeleted bool) ([]awsArticleSourceRow, error) {
	return ai.fetchFilteredArticles(ctx, awsArticleImportOptions{
		Limit:          limit,
		IncludeDeleted: includeDeleted,
	})
}

func (ai *awsArticleImporter) fetchFilteredArticles(ctx context.Context, opts awsArticleImportOptions) ([]awsArticleSourceRow, error) {
	estimatedSize := opts.Limit
	if estimatedSize <= 0 {
		estimatedSize = 16
	}
	articles := make([]awsArticleSourceRow, 0, estimatedSize)
	query := `
SELECT
  id,
  COALESCE(title, '') AS title,
  COALESCE(message, '') AS message,
  COALESCE(uid, 0) AS uid,
  COALESCE(add_time, 0) AS add_time,
  COALESCE(views, 0) AS views,
  COALESCE(comments, 0) AS comments,
  COALESCE(is_stick, 0) AS is_stick,
  COALESCE(set_top, 0) AS set_top,
  COALESCE(is_del, 0) AS is_del,
  COALESCE(category_id, 0) AS category_id
FROM aws_article
WHERE COALESCE(title, '') <> ''`
	args := make([]any, 0, len(opts.SourceUserIDs)+2)
	if !opts.IncludeDeleted {
		query += " AND COALESCE(is_del, 0) = 0"
	}
	if len(opts.SourceUserIDs) > 0 {
		query += " AND COALESCE(uid, 0) IN (" + buildSQLPlaceholders(len(opts.SourceUserIDs)) + ")"
		for _, uid := range opts.SourceUserIDs {
			args = append(args, uid)
		}
	}
	if opts.MinViews > 0 {
		query += " AND COALESCE(views, 0) >= ?"
		args = append(args, opts.MinViews)
	}
	query += " ORDER BY add_time DESC, id DESC"
	if opts.Limit > 0 {
		query += " LIMIT ?"
		args = append(args, opts.Limit)
	}

	if err := ai.sourceDB.Context(ctx).SQL(query, args...).Find(&articles); err != nil {
		return nil, err
	}

	if len(articles) == 0 {
		return articles, nil
	}

	userMap, err := ai.loadSourceUsers(ctx, articles)
	if err != nil {
		return nil, err
	}
	categoryMap, err := ai.loadSourceCategories(ctx, articles)
	if err != nil {
		return nil, err
	}
	for idx := range articles {
		articles[idx].UserName = strings.TrimSpace(userMap[articles[idx].UID])
		if cat, ok := categoryMap[articles[idx].CategoryID]; ok {
			articles[idx].CategoryTitle = strings.TrimSpace(cat.Title)
			articles[idx].CategorySlug = strings.TrimSpace(cat.URLToken)
		}
	}
	return articles, nil
}

func (ai *awsArticleImporter) loadSourceUsers(ctx context.Context, articles []awsArticleSourceRow) (map[int64]string, error) {
	uids := make([]int64, 0)
	seen := make(map[int64]struct{})
	for _, item := range articles {
		if item.UID == 0 {
			continue
		}
		if _, ok := seen[item.UID]; ok {
			continue
		}
		seen[item.UID] = struct{}{}
		uids = append(uids, item.UID)
	}
	if len(uids) == 0 {
		return map[int64]string{}, nil
	}

	rows := make([]awsUserSourceRow, 0, len(uids))
	if err := ai.sourceDB.Context(ctx).Table("aws_users").In("uid", uids).Cols("uid", "user_name").Find(&rows); err != nil {
		return nil, err
	}

	userMap := make(map[int64]string, len(rows))
	for _, row := range rows {
		userMap[row.UID] = row.UserName
	}
	return userMap, nil
}

type awsCategorySourceRow struct {
	Title    string
	URLToken string
}

func (ai *awsArticleImporter) loadSourceCategories(ctx context.Context, articles []awsArticleSourceRow) (map[int64]awsCategorySourceRow, error) {
	categoryIDs := make([]int64, 0)
	seen := make(map[int64]struct{})
	for _, item := range articles {
		if item.CategoryID == 0 {
			continue
		}
		if _, ok := seen[item.CategoryID]; ok {
			continue
		}
		seen[item.CategoryID] = struct{}{}
		categoryIDs = append(categoryIDs, item.CategoryID)
	}
	if len(categoryIDs) == 0 {
		return map[int64]awsCategorySourceRow{}, nil
	}

	rowsByID := make([]awsCategorySourceByIDRow, 0, len(categoryIDs))
	err := ai.sourceDB.Context(ctx).Table("aws_category").In("id", categoryIDs).Cols("id", "title", "url_token").Find(&rowsByID)
	if err == nil {
		categoryMap := make(map[int64]awsCategorySourceRow, len(rowsByID))
		for _, row := range rowsByID {
			categoryMap[row.ID] = awsCategorySourceRow{
				Title:    row.Title,
				URLToken: row.URLToken,
			}
		}
		return categoryMap, nil
	}

	rowsByCategoryID := make([]awsCategorySourceByCategoryIDRow, 0, len(categoryIDs))
	if err = ai.sourceDB.Context(ctx).Table("aws_category").In("category_id", categoryIDs).Cols("category_id", "title", "url_token").Find(&rowsByCategoryID); err != nil {
		return nil, err
	}

	categoryMap := make(map[int64]awsCategorySourceRow, len(rowsByCategoryID))
	for _, row := range rowsByCategoryID {
		categoryMap[row.CategoryID] = awsCategorySourceRow{
			Title:    row.Title,
			URLToken: row.URLToken,
		}
	}
	return categoryMap, nil
}

func (ai *awsArticleImporter) importOne(ctx context.Context, article awsArticleSourceRow, targetUserID string) (awsArticleImportResult, error) {
	result := awsArticleImportResult{
		SourceArticleID: article.ID,
		Title:           article.Title,
	}

	questionID := ""
	_, err := ai.targetDB.Transaction(func(session *xorm.Session) (any, error) {
		session = session.Context(ctx)

		record := &awsArticleImportRecord{}
		exist, err := session.Where("source_article_id = ?", article.ID).Get(record)
		if err != nil {
			return nil, err
		}
		if exist {
			result.Status = "skipped"
			result.TargetQuestionID = record.TargetQuestionID
			return nil, nil
		}

		questionID, err = genUniqueIDStrTx(session, entity.Question{}.TableName())
		if err != nil {
			return nil, err
		}
		articleTime := unixTimeOrNow(article.AddTime)
		questionStatus := entity.QuestionStatusAvailable
		questionShow := entity.QuestionShow
		if article.IsDel != 0 {
			questionStatus = entity.QuestionStatusDeleted
			questionShow = entity.QuestionHide
		}

		question := &entity.Question{
			ID:               questionID,
			CreatedAt:        articleTime,
			UpdatedAt:        articleTime,
			UserID:           targetUserID,
			InviteUserID:     "",
			LastEditUserID:   "0",
			Title:            article.Title,
			OriginalText:     article.Message,
			ParsedText:       article.Message,
			Pin:              mapAWSPin(article),
			Show:             questionShow,
			Status:           questionStatus,
			Type:             entity.ContentTypeArticle,
			ViewCount:        maxInt(article.Views, 0),
			UniqueViewCount:  0,
			VoteCount:        0,
			AnswerCount:      maxInt(article.Comments, 0),
			HotScore:         0,
			CollectionCount:  0,
			FollowCount:      0,
			AcceptedAnswerID: "0",
			LastAnswerID:     "0",
			PostUpdateTime:   articleTime,
			RevisionID:       "0",
			LinkedCount:      0,
		}
		if _, err = session.Insert(question); err != nil {
			return nil, err
		}

		tagInfos := make([]*entity.TagSimpleInfoForRevision, 0, 1)
		if article.CategoryID > 0 || article.CategoryTitle != "" || article.CategorySlug != "" {
			tagInfo, err := ai.ensureCategoryTagTx(session, targetUserID, article)
			if err != nil {
				return nil, err
			}
			if tagInfo != nil {
				tagRelStatus := entity.TagRelStatusAvailable
				if questionStatus == entity.QuestionStatusDeleted || questionShow == entity.QuestionHide {
					tagRelStatus = entity.TagRelStatusHide
				}
				tagRel := &entity.TagRel{
					CreatedAt: articleTime,
					UpdatedAt: articleTime,
					ObjectID:  question.ID,
					TagID:     tagInfo.ID,
					Status:    tagRelStatus,
				}
				if _, err = session.Insert(tagRel); err != nil {
					return nil, err
				}
				if tagRelStatus == entity.TagRelStatusAvailable {
					if _, err = session.Table(entity.Tag{}.TableName()).ID(tagInfo.ID).Incr("question_count", 1).Update(&entity.Tag{}); err != nil {
						return nil, err
					}
				}
				tagInfos = append(tagInfos, &entity.TagSimpleInfoForRevision{
					ID:              tagInfo.ID,
					MainTagID:       tagInfo.MainTagID,
					MainTagSlugName: tagInfo.MainTagSlugName,
					SlugName:        tagInfo.SlugName,
					DisplayName:     tagInfo.DisplayName,
					Recommend:       tagInfo.Recommend,
					Reserved:        tagInfo.Reserved,
					RevisionID:      tagInfo.RevisionID,
				})
			}
		}

		authorName := buildAWSAuthorName(article)
		meta := &entity.Meta{
			CreatedAt: articleTime,
			UpdatedAt: articleTime,
			ObjectID:  question.ID,
			Key:       entity.QuestionArticleAuthorKey,
			Value:     authorName,
		}
		if _, err = session.Insert(meta); err != nil {
			return nil, err
		}

		questionRevision := &entity.QuestionWithTagsRevision{
			Question: *question,
			Tags:     tagInfos,
		}
		revisionContent, err := json.Marshal(questionRevision)
		if err != nil {
			return nil, err
		}

		revision := &entity.Revision{
			CreatedAt: articleTime,
			UpdatedAt: articleTime,
			UserID:    targetUserID,
			ObjectID:  question.ID,
			Title:     question.Title,
			Content:   string(revisionContent),
			Status:    entity.RevisionNormalStatus,
		}
		if _, err = session.Insert(revision); err != nil {
			return nil, err
		}
		if _, err = session.Table(question.TableName()).ID(question.ID).Cols("revision_id").Update(&entity.Question{RevisionID: revision.ID}); err != nil {
			return nil, err
		}

		importRecord := &awsArticleImportRecord{
			SourceArticleID:  article.ID,
			SourceUID:        article.UID,
			SourceCategoryID: article.CategoryID,
			SourceAddTime:    article.AddTime,
			SourceTitle:      truncateString(article.Title, 255),
			TargetQuestionID: question.ID,
			TargetUserID:     targetUserID,
		}
		if _, err = session.Insert(importRecord); err != nil {
			return nil, err
		}

		result.Status = "imported"
		result.TargetQuestionID = question.ID
		return nil, nil
	})
	if err != nil {
		return result, err
	}

	return result, nil
}

func (ai *awsArticleImporter) ensureCategoryTagTx(session *xorm.Session, targetUserID string, article awsArticleSourceRow) (*entity.Tag, error) {
	slugName := buildAWSCategorySlug(article.CategorySlug, article.CategoryTitle, article.CategoryID)
	if slugName == "" {
		return nil, nil
	}

	displayName := strings.TrimSpace(article.CategoryTitle)
	if displayName == "" {
		displayName = slugName
	}

	tag := &entity.Tag{}
	exist, err := session.Where("slug_name = ?", slugName).UseBool("recommend", "reserved").Get(tag)
	if err != nil {
		return nil, err
	}
	if exist {
		updateCols := make([]string, 0)
		updateTag := &entity.Tag{}
		if tag.Status == entity.TagStatusDeleted {
			updateTag.Status = entity.TagStatusAvailable
			updateCols = append(updateCols, "status")
			tag.Status = entity.TagStatusAvailable
		}
		if strings.TrimSpace(tag.DisplayName) == "" && displayName != "" {
			updateTag.DisplayName = displayName
			updateCols = append(updateCols, "display_name")
			tag.DisplayName = displayName
		}
		if len(updateCols) > 0 {
			if _, err = session.Table(tag.TableName()).ID(tag.ID).Cols(updateCols...).Update(updateTag); err != nil {
				return nil, err
			}
		}
		return tag, nil
	}

	tagID, err := genUniqueIDStrTx(session, entity.Tag{}.TableName())
	if err != nil {
		return nil, err
	}

	tagCreatedAt := unixTimeOrNow(article.AddTime)
	tag = &entity.Tag{
		ID:            tagID,
		CreatedAt:     tagCreatedAt,
		UpdatedAt:     tagCreatedAt,
		SlugName:      slugName,
		DisplayName:   truncateString(displayName, 35),
		OriginalText:  fmt.Sprintf("从 AWS 分类迁移：%s", displayName),
		ParsedText:    converter.Markdown2HTML(fmt.Sprintf("从 AWS 分类迁移：%s", displayName)),
		QuestionCount: 0,
		Status:        entity.TagStatusAvailable,
		RevisionID:    "0",
		UserID:        targetUserID,
	}
	if _, err = session.Insert(tag); err != nil {
		return nil, err
	}

	tagRevisionContent, err := json.Marshal(tag)
	if err != nil {
		return nil, err
	}
	tagRevision := &entity.Revision{
		CreatedAt: tagCreatedAt,
		UpdatedAt: tagCreatedAt,
		UserID:    targetUserID,
		ObjectID:  tag.ID,
		Title:     tag.SlugName,
		Content:   string(tagRevisionContent),
		Status:    entity.RevisionNormalStatus,
	}
	if _, err = session.Insert(tagRevision); err != nil {
		return nil, err
	}
	if _, err = session.Table(tag.TableName()).ID(tag.ID).Cols("revision_id").Update(&entity.Tag{RevisionID: tagRevision.ID}); err != nil {
		return nil, err
	}
	tag.RevisionID = tagRevision.ID
	return tag, nil
}

func genUniqueIDStrTx(session *xorm.Session, key string) (string, error) {
	objectType, ok := constant.ObjectTypeStrMapping[key]
	if !ok {
		return "", fmt.Errorf("未知对象类型: %s", key)
	}
	bean := &entity.Uniqid{UniqidType: objectType}
	if _, err := session.Insert(bean); err != nil {
		return "", err
	}
	return fmt.Sprintf("1%03d%013d", objectType, bean.ID), nil
}

func mapAWSPin(article awsArticleSourceRow) int {
	if article.SetTop != 0 || article.IsStick != 0 {
		return entity.QuestionPin
	}
	return entity.QuestionUnPin
}

func buildAWSAuthorName(article awsArticleSourceRow) string {
	if name := strings.TrimSpace(article.UserName); name != "" {
		return name
	}
	if article.UID > 0 {
		return fmt.Sprintf("AWS用户%d", article.UID)
	}
	return "AWS迁移作者"
}

func buildAWSCategorySlug(urlToken, title string, categoryID int64) string {
	base := strings.TrimSpace(urlToken)
	if base == "" {
		base = strings.TrimSpace(title)
	}
	base = strings.ToLower(base)

	var builder strings.Builder
	lastDash := false
	for _, r := range base {
		switch {
		case r >= 'a' && r <= 'z':
			builder.WriteRune(r)
			lastDash = false
		case r >= '0' && r <= '9':
			builder.WriteRune(r)
			lastDash = false
		case r == '-' || r == '_' || unicode.IsSpace(r):
			if builder.Len() > 0 && !lastDash {
				builder.WriteByte('-')
				lastDash = true
			}
		}
	}

	slug := strings.Trim(builder.String(), "-")
	if slug == "" {
		slug = fmt.Sprintf("aws-category-%d", categoryID)
	}
	if len(slug) > 35 {
		slug = strings.Trim(slug[:35], "-")
	}
	if slug == "" {
		slug = fmt.Sprintf("aws-%d", categoryID)
	}
	return slug
}

func normalizeMySQLDSN(dsn string) string {
	normalized := strings.TrimSpace(dsn)
	if normalized == "" {
		return normalized
	}

	sep := "?"
	if strings.Contains(normalized, "?") {
		sep = "&"
	}
	lowerDSN := strings.ToLower(normalized)
	if !strings.Contains(lowerDSN, "charset=") {
		normalized += sep + "charset=utf8mb4"
		sep = "&"
	}
	if !strings.Contains(lowerDSN, "parsetime=") {
		normalized += sep + "parseTime=True"
		sep = "&"
	}
	if !strings.Contains(lowerDSN, "loc=") {
		normalized += sep + "loc=Local"
	}
	return normalized
}

func parseSourceUserIDs(values []string) ([]int64, error) {
	if len(values) == 0 {
		return nil, nil
	}
	result := make([]int64, 0, len(values))
	seen := make(map[int64]struct{})
	for _, raw := range values {
		for _, part := range strings.Split(raw, ",") {
			part = strings.TrimSpace(part)
			if part == "" {
				continue
			}
			uid, err := strconv.ParseInt(part, 10, 64)
			if err != nil {
				return nil, fmt.Errorf("无效用户 ID: %s", part)
			}
			if uid <= 0 {
				return nil, fmt.Errorf("无效用户 ID: %s", part)
			}
			if _, ok := seen[uid]; ok {
				continue
			}
			seen[uid] = struct{}{}
			result = append(result, uid)
		}
	}
	return result, nil
}

func buildSQLPlaceholders(count int) string {
	if count <= 0 {
		return ""
	}
	placeholders := make([]string, 0, count)
	for i := 0; i < count; i++ {
		placeholders = append(placeholders, "?")
	}
	return strings.Join(placeholders, ",")
}

func unixTimeOrNow(ts int64) time.Time {
	if ts <= 0 {
		return time.Now()
	}
	return time.Unix(ts, 0)
}

func truncateString(value string, limit int) string {
	if limit <= 0 {
		return ""
	}
	runes := []rune(value)
	if len(runes) <= limit {
		return value
	}
	return string(runes[:limit])
}

func maxInt(value, fallback int) int {
	if value < 0 {
		return fallback
	}
	return value
}
