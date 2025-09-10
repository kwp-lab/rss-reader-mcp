# RSS MCP Server

An MCP (Model Context Protocol) server for RSS feed aggregation and article content extraction. You can use it to subscribe to RSS feeds and fetch article lists, or extract the full content of an article from a URL and format it as Markdown.

English | [中文](./README_zh.md)

## 🚀 Quick Start

You can use this MCP server in MCP-capable clients such as [Claude Desktop](https://claude.ai/download) and [CherryStudio](https://www.cherry-ai.com/).

**Claude Desktop**

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

- Basic RSS Feed Fetching
  > Can you fetch the latest 5 headlines from the BBC News RSS feed?
URL: <https://feeds.bbci.co.uk/news/rss.xml>

- Full Article Content Extraction
  > Please extract the full content of this article and format it as Markdown:
<https://example.com/news/article-title>

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

## Docker Deployment

You can also run this MCP server in a Docker container. First, build the image from the project root:

```bash
docker build -t rss-reader-mcp .
```

Using CherryStudio as an example, the following configuration shows how to run this server through Docker:

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

## Some RSS Feeds for Testing

- **BBC News:** `https://feeds.bbci.co.uk/news/rss.xml`
- **TechCrunch:** `https://techcrunch.com/feed/`
- **Hacker News:** `https://hnrss.org/frontpage`
- **MIT Technology Review:** `https://www.technologyreview.com/feed/`
