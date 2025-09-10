# RSS Reader MCP

一个用于RSS源聚合和文章内容提取的大模型上下文协议（MCP）服务器，你可以使用它来订阅RSS源并获取文章列表，或者从URL提取完整文章内容并格式化为Markdown。

[English](./README.md) | 中文

[![npm version](https://img.shields.io/npm/v/rss-reader-mcp.svg)](https://www.npmjs.com/package/rss-reader-mcp)

[![license](https://img.shields.io/github/license/kwp-lab/rss-reader-mcp.svg)](LICENSE)

[![build status](https://img.shields.io/github/actions/workflow/status/kwp-lab/rss-reader-mcp/publish.yml?branch=main)](https://github.com/kwp-lab/rss-reader-mcp/actions/workflows/publish.yml)

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
        "-y"
        "rss-reader-mcp"
      ]
    }
  }
}
```

### 使用示例

- 基础RSS源获取
  > 能否从BBC新闻RSS源获取最新5条头条？
URL: https://feeds.bbci.co.uk/news/rss.xml

- 完整文章内容提取
  > 请将此文章完整内容提取为Markdown格式：
https://example.com/news/article-title

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

## Docker 部署

你也可以使用Docker容器运行此MCP服务器。首先，在工程根目录下构建Docker镜像：

```bash
docker build -t rss-reader-mcp .
```

使用 CherryStudio 为例，下面的示例展示了如何使用 CherryStudio 运行该服务器：

```json
{
  "mcpServers": {
    "rss-reader-mcp": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
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
