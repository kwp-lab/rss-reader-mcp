# RSS MCP Server - Usage Examples

This document provides practical examples of how to use the RSS MCP Server with Claude Desktop.

## Usage Examples

### Example 1: Fetch Latest News Headlines

**Prompt:**

```
"Can you fetch the latest 5 headlines from the BBC News RSS feed? The URL is https://feeds.bbci.co.uk/news/rss.xml"
```

**What happens:**

- Claude will use the `fetch_feed_entries` tool
- Returns feed metadata and article summaries
- No full article content (just titles, links, and summaries)

**Expected output format:**

```json
{
  "title": "BBC News - Home",
  "description": "BBC News - Home",
  "link": "https://www.bbc.co.uk/news/",
  "entries": [
    {
      "title": "Article Title",
      "link": "https://www.bbc.co.uk/news/article-url",
      "pubDate": "2025-06-06T10:30:00Z",
      "summary": "Brief article summary..."
    }
  ]
}
```

### Example 2: Get Full Article Content

**Prompt:**

```
"Please fetch the full content of this article and format it as Markdown: https://example.com/news/article-url"
```

**What happens:**

- Claude will use the `fetch_article_content` tool
- Extracts main content from the webpage
- Converts HTML to clean Markdown format
- Removes ads, navigation, and other non-content elements

**Expected output format:**

```json
{
  "title": "Article Title",
  "content": "# Article Title\n\nMarkdown content here...",
  "url": "https://example.com/news/article-url",
  "extractedAt": "2025-06-06T10:30:00.000Z"
}
```

### Example 3: RSS Feed Analysis

**Prompt:**

```
"Can you fetch the latest 10 articles from TechCrunch RSS feed (https://techcrunch.com/feed/) and analyze the main topics being covered?"
```

**What Claude can do:**

- Fetch multiple articles using `fetch_feed_entries`
- Analyze titles and summaries for common themes
- Provide insights about trending topics
- Suggest which articles might be most interesting

### Example 4: Content Aggregation Workflow

**Prompt:**

```
"I'd like to create a daily tech news summary. Can you:
1. Fetch latest articles from Hacker News RSS
2. Get the full content of the top 3 most interesting articles
3. Create a summary of each"
```

**Multi-step process:**

1. Uses `fetch_feed_entries` for the RSS feed
2. Uses `fetch_article_content` for each selected article
3. Claude analyzes and summarizes the content

### Example 5: Research Workflow

**Prompt:**

```
"I'm researching AI developments. Can you fetch articles from MIT Technology Review's AI section RSS feed and then get the full content of any articles about large language models?"
```

**Advanced workflow:**

1. Fetch RSS feed entries
2. Filter articles by keywords in titles/summaries
3. Extract full content for relevant articles
4. Provide comprehensive analysis

## Supported RSS Feed Types

The server works with most standard RSS and Atom feeds:

- **RSS 2.0** - Most common format
- **Atom 1.0** - Modern XML format
- **RSS 1.0** - RDF-based format

### Popular RSS Feeds for Testing

- **BBC News:** `https://feeds.bbci.co.uk/news/rss.xml`
- **TechCrunch:** `https://techcrunch.com/feed/`
- **Hacker News:** `https://hnrss.org/frontpage`
- **MIT Technology Review:** `https://www.technologyreview.com/feed/`
- **The Verge:** `https://www.theverge.com/rss/index.xml`

## Tool Parameters

### fetch_feed_entries

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `url` | string | Yes | RSS feed URL | - |
| `limit` | number | No | Max entries to return (1-100) | 10 |

### fetch_article_content

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | Article URL to extract content from |

## Troubleshooting

### Common Issues

1. **"Server not found" error:**
   - Check the file path in `claude_desktop_config.json`
   - Ensure the server was built (`npm run build`)
   - Restart Claude Desktop completely

2. **RSS feed not loading:**
   - Verify the RSS URL is correct and accessible
   - Some feeds may require specific user agents
   - Try with well-known feeds first (BBC, TechCrunch)

3. **Article content extraction fails:**
   - Some websites block automated access
   - Complex JavaScript-heavy sites may not work well
   - Paywalled content cannot be extracted

4. **Performance issues:**
   - Large RSS feeds may take time to process
   - Reduce the `limit` parameter for faster responses
   - Article extraction can be slow for heavy websites
