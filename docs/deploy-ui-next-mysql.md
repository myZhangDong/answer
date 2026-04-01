# ui-next + MySQL 上线清单

## 1. 服务器准备

- 安装 `Go 1.22+`
- 安装 `Node.js 20+`
- 安装 `npm`
- 安装 `MySQL 8.x`
- 准备部署目录，例如：

```bash
/srv/answer
/srv/answer-data
```

## 2. MySQL 准备

先手工创建数据库和账号。当前程序不会自动 `CREATE DATABASE`。

```sql
CREATE DATABASE answer DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'answer'@'%' IDENTIFIED BY '你的强密码';
GRANT ALL PRIVILEGES ON answer.* TO 'answer'@'%';
FLUSH PRIVILEGES;
```

建议确认：

- 时区正常
- `max_connections` 足够
- 字符集是 `utf8mb4`

## 3. 构建产物

在代码目录执行：

```bash
make generate
make ui-next
make build
```

产物重点：

- 后端二进制：`./answer`
- 新前端静态文件：`./ui-next/dist`

注意：

- `make build` 只编 Go 二进制
- `run-ui-next` 运行时依赖本地 `ui-next/dist`
- 改了 Go 代码后要重新 `make build`
- 改了 `ui-next` 后要重新 `make ui-next`

## 4. 部署目录

建议把这些放到服务器：

- 二进制：`/srv/answer/answer`
- 前端 dist：`/srv/answer/ui-next/dist`
- 数据目录：`/srv/answer-data`

例如：

```bash
mkdir -p /srv/answer
mkdir -p /srv/answer-data
```

## 5. 首次初始化

第一次上线先执行：

```bash
cd /srv/answer
./answer init -C /srv/answer-data
```

这一步会：

- 创建 `/srv/answer-data/conf`
- 创建 `/srv/answer-data/uploads`
- 创建 `/srv/answer-data/i18n`
- 启动安装页

然后打开安装页完成初始化。

## 6. 安装页填写

数据库填写：

- `DB Type`: `mysql`
- `DB Host`: `127.0.0.1:3306` 或实际地址
- `DB Name`: `answer`
- `DB Username`: `answer`
- `DB Password`: 你的密码

站点基础信息填写：

- 站点名称
- 站点 URL，必须填正式域名
- 管理员账号
- 管理员密码
- 管理员邮箱

## 7. 核对配置文件

安装完成后，检查：

`/srv/answer-data/conf/config.yaml`

关键项至少确认这些：

```yaml
server:
  http:
    addr: 0.0.0.0:80

data:
  database:
    driver: "mysql"
    connection: "answer:你的密码@tcp(127.0.0.1:3306)/answer"

service_config:
  upload_path: "/srv/answer-data/uploads"

swaggerui:
  show: false
```

建议：

- 生产环境把 `swaggerui.show` 关掉
- `upload_path` 指向持久化目录
- 如果前面有 Nginx，应用可直接监听 `127.0.0.1:8080`

例如：

```yaml
server:
  http:
    addr: 127.0.0.1:8080
```

## 8. 启动 ui-next

正式运行用这个命令，不要用默认 `run`：

```bash
cd /srv/answer
./answer run-ui-next -C /srv/answer-data
```

因为：

- `run-ui-next` 会自动使用 `ui-next/dist`
- 默认 `run` / `run-ui` 还是旧前端链路

## 9. 反向代理

建议 Nginx 代理到后端，例如 `127.0.0.1:8080`。

最小示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 100m;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

如果上 HTTPS，再配证书即可。

## 10. systemd 托管

建议加 systemd：

```ini
[Unit]
Description=Answer ui-next
After=network.target mysql.service

[Service]
Type=simple
WorkingDirectory=/srv/answer
ExecStart=/srv/answer/answer run-ui-next -C /srv/answer-data
Restart=always
RestartSec=5
Environment=SITE_ADDR=127.0.0.1:8080

[Install]
WantedBy=multi-user.target
```

然后：

```bash
sudo systemctl daemon-reload
sudo systemctl enable answer
sudo systemctl start answer
sudo systemctl status answer
```

## 11. 升级流程

后续版本发布时按这个顺序：

1. 备份数据库
2. 备份 `/srv/answer-data`
3. 替换代码或二进制
4. 重新构建：

```bash
make ui-next
make build
```

5. 执行数据库升级：

```bash
./answer upgrade -C /srv/answer-data
```

6. 重启服务

注意：

- `run-ui-next` 不会自动做数据库升级
- 升级要显式执行 `answer upgrade`

## 12. 上线后检查

至少检查这些：

- 首页能打开
- 后台能登录
- 文章创建正常
- 视频创建正常
- 封面上传正常
- 图片和附件上传正常
- `/uploads/...` 能访问
- 列表页接口正常
- MySQL 连接无报错
- 服务重启后数据仍在

## 13. 常见坑

- 用了 `./answer run`，结果跑的是旧前端，不是 `ui-next`
- 只重启二进制，没有重新 `make build`
- 改了 `ui-next` 但没重新 `make ui-next`
- MySQL 库没提前创建
- `config.yaml` 里的连接串不对
- 上传目录没持久化
- Nginx 没放开上传大小
