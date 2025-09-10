# RSS Reader MCP

一个用于RSS源聚合和文章内容提取的大模型上下文协议（MCP）服务器，你可以使用它来订阅RSS源并获取文章列表，或者从URL提取完整文章内容并格式化为Markdown。

[English](./README.md) | 中文

[![npm version](https://img.shields.io/npm/v/rss-reader-mcp.svg)](https://www.npmjs.com/package/rss-reader-mcp)
[![license](https://img.shields.io/github/license/kwp-lab/rss-reader-mcp.svg)](LICENSE)
[![build status](https://img.shields.io/github/actions/workflow/status/kwp-lab/rss-reader-mcp/publish.yml?branch=main)](https://github.com/kwp-lab/rss-reader-mcp/actions/workflows/publish.yml)
[![smithery badge](https://smithery.ai/badge/@kwp-lab/rss-reader-mcp)](https://smithery.ai/server/@kwp-lab/rss-reader-mcp)

## 🚀 快速开始

你可以在MCP客户端（如[Claude Desktop](https://claude.ai/download)、[CherryStudio](https://www.cherry-ai.com/)等）中使用此 MCP 服务器。

**Claude Desktop**

对于 Claude Desktop，你需要在 `claude_desktop_config.json` 文件的 “mcpServers” 部分添加以下配置信息：

```json
{
  "mcpServers": {
    "rss-reader": {
      "command": "npx",
      "args": [
        "-y",
        "rss-reader-mcp"
      ]
    }
  }
}
```

### 使用示例

- 基础RSS源获取

  > 能否从BBC新闻RSS源获取最新5条头条？
  > URL: https://feeds.bbci.co.uk/news/rss.xml

- 完整文章内容提取
  > 请将此文章完整内容提取为Markdown格式：
  > https://example.com/news/article-title

## 🔧 工具参考

### `fetch_feed_entries`

从指定URL获取RSS源条目

**参数：**

- `url` (必填字符串)：RSS源URL
- `limit` (可选数字)：返回条目上限（默认10，最大100）

**返回：** 包含源元数据和条目列表的JSON对象（含标题、链接、发布日期和摘要）

### `fetch_article_content`

从URL提取文章内容并格式化为Markdown

**参数：**

- `url` (必填字符串)：文章URL

**返回：** 包含标题、Markdown内容、源URL和时间戳的JSON对象

## ⚙️ 传输方式与环境变量

该服务器支持两种传输方式：

- stdio（默认）：通过标准输入/输出进行通信，适合 Claude Desktop 等使用本地进程的客户端。
- httpStream：通过 HTTP 流进行通信，适合支持 HTTP(S) 传输的客户端或容器化部署。

可用环境变量：

- TRANSPORT：选择传输方式，取值为 `stdio`（默认）或 `httpStream`。
- PORT：当 `TRANSPORT=httpStream` 时的监听端口，默认 `8081`。
- MCP_SERVER_HOST：当 `TRANSPORT=httpStream` 时的监听地址，默认 `localhost`；在 Docker 中应设置为 `0.0.0.0` 以对外暴露端口。

如何切换传输方式：

- 使用 stdio（无需额外设置，默认）：
  - 适用于 Claude Desktop 的 `command + args` 方式（见下文示例）。
- 使用 httpStream：
  - 设置环境变量 `TRANSPORT=httpStream` 并指定 `PORT`（如不指定则为 8081）。
  - 如在容器中运行，请同时设置 `MCP_SERVER_HOST=0.0.0.0` 并映射端口。
  - Dockerfile 中已经包含相关环境变量设置。

## Docker 部署

你也可以使用Docker容器运行此MCP服务器。首先，在工程根目录下构建Docker镜像：

```bash
docker build -t rss-reader-mcp .
```

使用 CherryStudio 为例，下面的示例展示了如何使用 CherryStudio 以 HTTP 方式运行该服务器：

```json
{
  "mcpServers": {
    "rss-reader-mcp": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-p",
        "8081:8081",
        "-e",
        "PORT=8081",
        "rss-reader-mcp"
      ]
    }
  }
}
```

## 一些用于测试的 RSS 源

- **BBC新闻：** `https://feeds.bbci.co.uk/news/rss.xml`
- **TechCrunch：** `https://techcrunch.com/feed/`
- **Hacker News：** `https://hnrss.org/frontpage`
- **MIT科技评论：** `https://www.technologyreview.com/feed/`
