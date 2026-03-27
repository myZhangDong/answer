#!/bin/bash

# 从config.yaml读取数据库配置
echo "=== 插入Video测试数据到MySQL数据库 ==="
echo

# 根据配置文件，数据库连接信息为：
# host: localhost
# port: 8889
# user: root
# password: root
# database: answer

# 方法1: 直接执行SQL文件
echo "方法1: 使用mysql客户端直接执行SQL文件"
echo "mysql -h localhost -P 8889 -u root -proot answer < test_video_data.sql"
echo

# 方法2: 交互式执行
echo "方法2: 交互式连接数据库"
echo "mysql -h localhost -P 8889 -u root -proot answer"
echo "然后复制粘贴以下SQL命令："
echo

cat test_video_data.sql

echo
echo "=== 执行完成后可以验证数据 ==="
echo "SELECT COUNT(*) FROM video;"
echo "SELECT id, title, author_name, type FROM video;"
