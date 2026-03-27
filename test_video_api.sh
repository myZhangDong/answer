#!/bin/bash

# Video API测试脚本

BASE_URL="http://localhost:80/answer/api/v1"

echo "=== 测试Video接口 ==="
echo

# 测试获取视频列表
echo "1. 测试获取视频列表"
echo "GET ${BASE_URL}/video/page"
curl -s -X GET "${BASE_URL}/video/page?page=1&page_size=10&order=newest" \
     -H "Content-Type: application/json" | jq '.' 2>/dev/null || curl -s -X GET "${BASE_URL}/video/page?page=1&page_size=10&order=newest"
echo
echo

# 测试搜索视频
echo "2. 测试搜索视频"
echo "GET ${BASE_URL}/video/page?search=Go"
curl -s -X GET "${BASE_URL}/video/page?search=Go&page=1&page_size=5" \
     -H "Content-Type: application/json" | jq '.' 2>/dev/null || curl -s -X GET "${BASE_URL}/video/page?search=Go&page=1&page_size=5"
echo
echo

# 测试按类型筛选
echo "3. 测试按类型筛选"
echo "GET ${BASE_URL}/video/page?type=tutorial"
curl -s -X GET "${BASE_URL}/video/page?type=tutorial&page=1&page_size=5" \
     -H "Content-Type: application/json" | jq '.' 2>/dev/null || curl -s -X GET "${BASE_URL}/video/page?type=tutorial&page=1&page_size=5"
echo
echo

# 测试获取推荐视频
echo "4. 测试获取推荐视频"
echo "GET ${BASE_URL}/video/page?order=recommend"
curl -s -X GET "${BASE_URL}/video/page?order=recommend&page=1&page_size=5" \
     -H "Content-Type: application/json" | jq '.' 2>/dev/null || curl -s -X GET "${BASE_URL}/video/page?order=recommend&page=1&page_size=5"
echo
echo

# 测试获取单个视频信息
echo "5. 测试获取单个视频信息"
echo "GET ${BASE_URL}/video/info?id=1000000000000001"
curl -s -X GET "${BASE_URL}/video/info?id=1000000000000001" \
     -H "Content-Type: application/json" | jq '.' 2>/dev/null || curl -s -X GET "${BASE_URL}/video/info?id=1000000000000001"
echo
echo

echo "=== 测试完成 ==="
