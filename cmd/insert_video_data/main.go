package main

import (
	"fmt"
	"log"
	"time"

	"github.com/apache/answer/internal/entity"
	_ "github.com/go-sql-driver/mysql"
	"xorm.io/xorm"
)

func main() {
	fmt.Println("=== 插入Video测试数据 ===")

	// 连接数据库 (根据config.yaml中的配置)
	engine, err := xorm.NewEngine("mysql", "root:root@tcp(localhost:8889)/answer?charset=utf8mb4&parseTime=true&loc=Local")
	if err != nil {
		log.Fatalf("连接数据库失败: %v", err)
	}
	defer engine.Close()

	// 测试连接
	if err := engine.Ping(); err != nil {
		log.Fatalf("数据库连接测试失败: %v", err)
	}
	fmt.Println("✓ 数据库连接成功")

	// 检查video表是否存在
	exists, err := engine.IsTableExist(&entity.Video{})
	if err != nil {
		log.Fatalf("检查video表失败: %v", err)
	}
	if !exists {
		log.Fatalf("video表不存在，请先运行数据库迁移")
	}
	fmt.Println("✓ video表已存在")

	// 准备测试数据
	now := time.Now()
	videos := []*entity.Video{
		{
			ID:           "1000000000000001",
			CreatedAt:    now,
			UpdatedAt:    now,
			Title:        "Go语言入门教程",
			IsRecommend:  entity.VideoRecommend,
			IsShow:       entity.VideoShow,
			Cover:        "https://example.com/cover1.jpg",
			Description:  "这是一个关于Go语言基础入门的视频教程，适合初学者学习。",
			Content:      "# Go语言入门教程\n\n本视频将带你从零开始学习Go语言...",
			AuthorAvatar: "https://example.com/avatar1.jpg",
			AuthorName:   "张老师",
			AuthorIntro:  "Go语言资深开发者，5年开发经验",
			ExternalLink: "https://www.youtube.com/watch?v=example1",
			Code:         "GO_TUTORIAL_001",
			Duration:     3600,
			Type:         "tutorial",
			Datetime:     now,
			UID:          "1",
			ViewCount:    0,
			Status:       entity.VideoStatusAvailable,
		},
		{
			ID:           "1000000000000002",
			CreatedAt:    now,
			UpdatedAt:    now,
			Title:        "React开发实战",
			IsRecommend:  entity.VideoRecommend,
			IsShow:       entity.VideoShow,
			Cover:        "https://example.com/cover2.jpg",
			Description:  "从零到一构建React应用，包含最新的React Hooks使用方法。",
			Content:      "# React开发实战\n\n本课程将教你如何使用React构建现代化的Web应用...",
			AuthorAvatar: "https://example.com/avatar2.jpg",
			AuthorName:   "李老师",
			AuthorIntro:  "前端开发专家，React核心贡献者",
			ExternalLink: "https://www.youtube.com/watch?v=example2",
			Code:         "REACT_ADVANCED_002",
			Duration:     5400,
			Type:         "advanced",
			Datetime:     now,
			UID:          "2",
			ViewCount:    15,
			Status:       entity.VideoStatusAvailable,
		},
		{
			ID:           "1000000000000003",
			CreatedAt:    now,
			UpdatedAt:    now,
			Title:        "数据库设计原理",
			IsRecommend:  entity.VideoNotRecommend,
			IsShow:       entity.VideoShow,
			Cover:        "https://example.com/cover3.jpg",
			Description:  "深入理解数据库设计原理，掌握高效的数据库设计方法。",
			Content:      "# 数据库设计原理\n\n本视频将深入讲解数据库设计的核心原理...",
			AuthorAvatar: "https://example.com/avatar3.jpg",
			AuthorName:   "王老师",
			AuthorIntro:  "数据库架构师，10年数据库设计经验",
			ExternalLink: "https://www.youtube.com/watch?v=example3",
			Code:         "DB_DESIGN_003",
			Duration:     4800,
			Type:         "theory",
			Datetime:     now,
			UID:          "3",
			ViewCount:    8,
			Status:       entity.VideoStatusAvailable,
		},
	}

	// 插入数据
	insertedCount := 0
	skippedCount := 0

	for _, video := range videos {
		// 检查是否已存在
		exists, err := engine.Where("id = ?", video.ID).Exist(&entity.Video{})
		if err != nil {
			log.Printf("检查视频 %s 是否存在时出错: %v", video.ID, err)
			continue
		}

		if exists {
			fmt.Printf("⚠ 视频 %s '%s' 已存在，跳过\n", video.ID, video.Title)
			skippedCount++
			continue
		}

		// 插入数据
		_, err = engine.Insert(video)
		if err != nil {
			log.Printf("插入视频 %s 失败: %v", video.ID, err)
			continue
		}

		fmt.Printf("✓ 成功插入视频: %s - %s\n", video.ID, video.Title)
		insertedCount++
	}

	fmt.Printf("\n=== 插入完成 ===\n")
	fmt.Printf("插入数量: %d\n", insertedCount)
	fmt.Printf("跳过数量: %d\n", skippedCount)

	// 验证数据
	var count int64
	count, err = engine.Count(&entity.Video{})
	if err != nil {
		log.Printf("获取视频总数失败: %v", err)
	} else {
		fmt.Printf("数据库中总视频数: %d\n", count)
	}

	fmt.Println("\n✓ 测试数据插入完成！")
}
