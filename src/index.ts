#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import Parser from "rss-parser";
import axios from "axios";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";
import {
  FeedInfo,
  RSSFeedEntry,
  ArticleContent,
  isValidFetchFeedArgs,
  isValidFetchArticleArgs,
} from "./types.js";

class RSSMCPServer {
  private readonly server: Server;
  private readonly rssParser: Parser;
  private readonly turndownService: TurndownService;

  constructor() {
    this.server = new Server(
      {
        name: "rss-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.rssParser = new Parser({
      customFields: {
        feed: ['language', 'copyright'],
        item: ['summary', 'category']
      }
    });

    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
    });

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "fetch_feed_entries",
            description: "Fetch RSS feed entries from a given URL",
            inputSchema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "The RSS feed URL to fetch",
                },
                limit: {
                  type: "number",
                  description: "Maximum number of entries to return (default: 10)",
                  minimum: 1,
                  maximum: 100,
                },
              },
              required: ["url"],
            },
          },
          {
            name: "fetch_article_content",
            description: "Fetch and extract article content from a URL, formatted as Markdown",
            inputSchema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "The article URL to fetch content from",
                },
              },
              required: ["url"],
            },
          },
        ] as Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "fetch_feed_entries":
            return await this.handleFetchFeedEntries(args);
          case "fetch_article_content":
            return await this.handleFetchArticleContent(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleFetchFeedEntries(args: unknown) {
    if (!isValidFetchFeedArgs(args)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid arguments for fetch_feed_entries"
      );
    }

    try {
      const { url, limit = 10 } = args;
      const feed = await this.rssParser.parseURL(url);
        const feedInfo: FeedInfo = {
        title: feed.title ?? "Untitled Feed",
        description: feed.description,
        link: feed.link ?? url,
        lastBuildDate: feed.lastBuildDate,
        entries: feed.items.slice(0, limit).map((item): RSSFeedEntry => ({
          title: item.title ?? "Untitled",
          link: item.link ?? "",
          pubDate: item.pubDate ?? item.isoDate,
          creator: item.creator ?? item.author,
          summary: item.summary ?? item.contentSnippet,
          categories: item.categories,
          guid: item.guid,
        })),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(feedInfo, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch RSS feed: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleFetchArticleContent(args: unknown) {
    if (!isValidFetchArticleArgs(args)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid arguments for fetch_article_content"
      );
    }

    try {
      const { url } = args;
      
      // Fetch the webpage
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 30000,
      });

      // Parse HTML
      const dom = new JSDOM(response.data);
      const document = dom.window.document;      // Extract title
      let title = document.querySelector('title')?.textContent ?? 
                 document.querySelector('h1')?.textContent ?? 
                 'Untitled Article';

      // Clean up title
      title = title.trim();      // Try to find main content
      let contentElement = 
        document.querySelector('article') ??
        document.querySelector('[role="main"]') ??
        document.querySelector('.content') ??
        document.querySelector('.post-content') ??
        document.querySelector('.entry-content') ??
        document.querySelector('.article-content') ??
        document.querySelector('main') ??
        document.querySelector('.container');

      // If no specific content container found, try to find the largest text block
      if (!contentElement) {
        const paragraphs = Array.from(document.querySelectorAll('p'));
        if (paragraphs.length > 0) {
          // Find the parent element that contains the most paragraphs
          const parentCounts = new Map();          paragraphs.forEach(p => {
            let parent = p.parentElement;
            while (parent && parent !== document.body) {
              const count = parentCounts.get(parent) ?? 0;
              parentCounts.set(parent, count + 1);
              parent = parent.parentElement;
            }
          });
          
          let maxCount = 0;
          let bestParent = null;
          parentCounts.forEach((count, parent) => {
            if (count > maxCount) {
              maxCount = count;
              bestParent = parent;
            }
          });
          
          contentElement = bestParent;
        }
      }      contentElement ??= document.body;

      // Remove unwanted elements
      const unwantedSelectors = [
        'script', 'style', 'nav', 'header', 'footer', 
        '.sidebar', '.navigation', '.menu', '.ads', 
        '.advertisement', '.social-share', '.comments',
        '.related-posts', '.author-bio'
      ];
      
      unwantedSelectors.forEach(selector => {
        contentElement!.querySelectorAll(selector).forEach(el => el.remove());
      });

      // Convert to markdown
      const htmlContent = contentElement.innerHTML;
      let markdownContent = this.turndownService.turndown(htmlContent);      // Clean up the markdown
      markdownContent = markdownContent
        .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
        .replace(/^(\s+)|(\s+)$/g, '') // Trim whitespace
        .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '') // Remove complex image links
        .trim();

      const articleContent: ArticleContent = {
        title,
        content: markdownContent,
        url,
        extractedAt: new Date().toISOString(),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(articleContent, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch article content: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("RSS MCP server running on stdio");
  }
}

const server = new RSSMCPServer();
server.run().catch(console.error);
