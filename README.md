<a href="https://answer.apache.org">
    <img alt="logo" src="docs/img/logo.svg" height="99px">
</a>

# Apache Answer - Build Q&A platform

A Q&A platform software for teams at any scales. Whether it’s a community forum, help center, or knowledge management platform, you can always count on Answer.

To learn more about the project, visit [answer.apache.org](https://answer.apache.org).

[![LICENSE](https://img.shields.io/github/license/apache/answer)](https://github.com/apache/answer/blob/main/LICENSE)
[![Language](https://img.shields.io/badge/language-go-blue.svg)](https://golang.org/)
[![Language](https://img.shields.io/badge/language-react-blue.svg)](https://reactjs.org/)
[![Go Report Card](https://goreportcard.com/badge/github.com/apache/answer)](https://goreportcard.com/report/github.com/apache/answer)
[![Discord](https://img.shields.io/badge/discord-chat-5865f2?logo=discord&logoColor=f5f5f5)](https://discord.gg/Jm7Y4cbUej)

## Screenshots

![screenshot](docs/img/screenshot.png)

## Quick start

### Running with docker

```bash
docker compose up -d --build
```

Notes:

- This workspace defaults Docker startup to `ui-next`
- To switch the container back to legacy `ui/`, set `ANSWER_DOCKER_FRONTEND=ui`
- Container data is still persisted via `/data`

For more information, see [Installation](https://answer.apache.org/docs/installation).

### Plugins

Answer provides a plugin system for developers to create custom plugins and expand Answer’s features. You can find the [plugin documentation here](https://answer.apache.org/community/plugins).

We value your feedback and suggestions to improve our documentation. If you have any comments or questions, please feel free to contact us. We’re excited to see what you can create using our plugin system!

You can also check out the [plugins here](https://answer.apache.org/plugins).

## Building from Source

### Prerequisites

- Golang >= 1.22
- Node.js >= 20
- pnpm >= 9
- [mockgen](https://github.com/uber-go/mock?tab=readme-ov-file#installation) >= 1.6.0
- [wire](https://github.com/google/wire/) >= 0.5.0

### Build

```bash
# Install wire and mockgen for building. You can run `make check` to check if they are installed.
$ make generate
# Build legacy frontend ui/
$ make ui
# Or build new frontend ui-next/
$ make ui-next
# Build backend binary
$ make build
```

### Run with different frontends

This workspace currently keeps two frontend projects:

- `ui/`: legacy frontend, still used by the default embed build chain
- `ui-next/`: new frontend used for the content portal migration

Build and run commands:

```bash
# Legacy frontend
make ui
./answer run-ui -C ./data

# New frontend
make ui-next
./answer run-ui-next -C ./data
```

Notes:

- `./answer run` only starts the current binary. It does not rebuild Go code or frontend assets.
- After changing Go code, rebuild the binary before restarting:

```bash
go build -o ./answer ./cmd/answer
```

- After changing `ui/`, rebuild `ui/` and then rebuild `./answer`, because `ui/build` is embedded into the binary.
- After changing `ui-next/`, rebuild `ui-next/` first. `run-ui-next` serves `ui-next/dist` via `ANSWER_STATIC_PATH`, and switches the backend to `ui-next` route mode with `ANSWER_FRONTEND=ui-next`.

## Data migration

This repository includes a CLI command for migrating legacy `aws_article` data into Answer articles.

See:

- [docs/aws-article-import.md](docs/aws-article-import.md)

Quick examples:

```bash
# Import up to 500 articles for one legacy user, only when pv >= 100
./answer import-aws-article \
  -C /app/data \
  --source-dsn 'root:thinkcmf@tcp(120.26.119.226:3306)/bbs2021' \
  --target-user-id 12345 \
  --source-user-id 36298 \
  --min-views 100 \
  --limit 500

# Import all articles for another legacy user
./answer import-aws-article \
  -C /app/data \
  --source-dsn 'root:thinkcmf@tcp(120.26.119.226:3306)/bbs2021' \
  --target-user-id 12345 \
  --source-user-id 33607 \
  --limit 0
```

## Contributing

Contributions are always welcome!

See [CONTRIBUTING](https://answer.apache.org/community/contributing) for ways to get started.

## License

[Apache License 2.0](https://github.com/apache/answer/blob/main/LICENSE)
