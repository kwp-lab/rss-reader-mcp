# RSS Reader MCP

An MCP (Model Context Protocol) server for RSS feed aggregation and article content extraction. You can use it to subscribe to RSS feeds and get article lists, or extract the full content of an article from a URL and format it as Markdown.

English | [中文](./README_zh.md)

[![npm version](https://img.shields.io/npm/v/rss-reader-mcp.svg)](https://www.npmjs.com/package/rss-reader-mcp)
[![license](https://img.shields.io/github/license/kwp-lab/rss-reader-mcp.svg)](LICENSE)
[![build status](https://img.shields.io/github/actions/workflow/status/kwp-lab/rss-reader-mcp/publish.yml?branch=main)](https://github.com/kwp-lab/rss-reader-mcp/actions/workflows/publish.yml)
[![smithery badge](https://smithery.ai/badge/@kwp-lab/rss-reader-mcp)](https://smithery.ai/server/@kwp-lab/rss-reader-mcp)

## 🚀 Quick Start

You can use this MCP server in MCP-capable clients such as [Claude Desktop](https://claude.ai/download) and [CherryStudio](https://www.cherry-ai.com/).

### Claude Desktop

For Claude Desktop, add the following configuration under the "mcpServers" section in your `claude_desktop_config.json` file:

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

### Usage Examples

- Basic RSS feed fetching

  > Can you fetch the latest 5 headlines from the BBC News RSS feed?
  > URL: <https://feeds.bbci.co.uk/news/rss.xml>

- Full article content extraction
  > Please extract the full content of this article and format it as Markdown:
  > <https://example.com/news/article-title>

## 🔧 Tools Reference

### `fetch_feed_entries`

Fetch RSS entries from a specified URL

**Parameters:**

- `url` (required string): RSS feed URL
- `limit` (optional number): Maximum number of entries to return (default 10, max 100)

**Returns:** A JSON object containing feed metadata and a list of entries (including title, link, publication date, and summary)

### `fetch_article_content`

Extract article content from a URL and format it as Markdown

**Parameters:**

- `url` (required string): Article URL

**Returns:** A JSON object containing the title, Markdown content, source URL, and timestamp

## ⚙️ Transport & Environment Variables

This server supports two transport modes:

- stdio (default): Communicates via standard input/output. Suitable for clients that run a local process, such as Claude Desktop.
- httpStream: Communicates over HTTP streaming. Suitable for clients that support HTTP(S) transport or for containerized deployments.

Available environment variables:

- TRANSPORT: Select the transport mode, either `stdio` (default) or `httpStream`.
- PORT: When `TRANSPORT=httpStream`, the listening port (default `8081`).
- MCP_SERVER_HOST: When `TRANSPORT=httpStream`, the listening address (default `localhost`). In Docker, set this to `0.0.0.0` to expose the port externally.

How to switch transport modes:

- Using stdio (no extra setup, default):
  - Works with Claude Desktop via the `command + args` configuration (see example above).
- Using httpStream:
  - Set the environment variable `TRANSPORT=httpStream` and specify `PORT` (defaults to 8081 if not set).
  - When running in a container, also set `MCP_SERVER_HOST=0.0.0.0` and map the port.
  - The Dockerfile in this repository already includes related environment variable settings.

## Docker Deployment

You can also run this MCP server in a Docker container. First, build the image in the project root:

```bash
docker build -t rss-reader-mcp .
```

Using CherryStudio as an example, the following configuration shows how to run this server over HTTP:

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

## Some RSS Feeds for Testing

- **BBC News:** `https://feeds.bbci.co.uk/news/rss.xml`
- **TechCrunch:** `https://techcrunch.com/feed/`
- **Hacker News:** `https://hnrss.org/frontpage`
- **MIT Technology Review:** `https://www.technologyreview.com/feed/`
