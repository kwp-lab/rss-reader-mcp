#!/usr/bin/env node
import { FastMCP, UserError } from "fastmcp";
import { z } from "zod";
import Parser from "rss-parser";
import { fetch as nodeFetch } from "node-fetch-native";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";
import { FeedInfo, RSSFeedEntry, ArticleContent } from "./types.js";

// Initialize helpers once
const rssParser = new Parser();

const turndownService = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

// Create FastMCP server
const server = new FastMCP({
  name: "rss-reader-mcp",
  version: "1.0.0",
  // stdio defaults to no pings; keep it quiet
});

// Tool: fetch_feed_entries
server.addTool({
  name: "fetch_feed_entries",
  description: "Fetch RSS feed entries from a given URL",
  parameters: z.object({
    url: z.string().url("Invalid URL format"),
    limit: z.number().int().min(1).max(100).optional(),
  }),
  annotations: {
    title: "Fetch RSS Feed Entries",
    readOnlyHint: true,
    openWorldHint: true,
    idempotentHint: true,
  },
  execute: async ({ url, limit = 10 }) => {
    try {
      const feed = await rssParser.parseURL(url);
      type RawItem = {
        title?: string;
        link?: string;
        pubDate?: string;
        isoDate?: string;
        creator?: string;
        author?: string;
        summary?: string;
        contentSnippet?: string;
        categories?: string[];
        guid?: string;
      };
      const feedInfo: FeedInfo = {
        title: feed.title ?? "Untitled Feed",
        description: feed.description,
        link: feed.link ?? url,
        lastBuildDate: feed.lastBuildDate,
        entries: (feed.items ?? []).slice(0, limit).map(
          (item: RawItem): RSSFeedEntry => ({
            title: item.title ?? "Untitled",
            link: item.link ?? "",
            pubDate: item.pubDate ?? item.isoDate,
            creator: item.creator ?? item.author,
            summary: item.summary ?? item.contentSnippet,
            categories: item.categories,
            guid: item.guid,
          }),
        ),
      };

      return JSON.stringify(feedInfo, null, 2);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new UserError(`Failed to fetch RSS feed: ${message}`);
    }
  },
});

// Tool: fetch_article_content
server.addTool({
  name: "fetch_article_content",
  description:
    "Fetch and extract article content from a URL, formatted as Markdown",
  parameters: z.object({
    url: z.string().url("Invalid URL format"),
  }),
  annotations: {
    title: "Fetch Article Content",
    readOnlyHint: true,
    openWorldHint: true,
    idempotentHint: true,
    streamingHint: false,
  },
  execute: async ({ url }) => {
    try {
      // Implement timeout via AbortController since fetch has no native timeout option
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30_000);
      const response = await nodeFetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        redirect: "follow",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Extract title
      let title =
        document.querySelector("title")?.textContent ??
        document.querySelector("h1")?.textContent ??
        "Untitled Article";
      title = title.trim();

      // Try to find main content
      let contentElement =
        document.querySelector("article") ??
        document.querySelector('[role="main"]') ??
        document.querySelector(".content") ??
        document.querySelector(".post-content") ??
        document.querySelector(".entry-content") ??
        document.querySelector(".article-content") ??
        document.querySelector("main") ??
        document.querySelector(".container");

      if (!contentElement) {
        const paragraphs = Array.from(document.querySelectorAll("p"));
        if (paragraphs.length > 0) {
          const parentCounts = new Map<Element, number>();
          paragraphs.forEach((p) => {
            let parent = p.parentElement;
            while (parent && parent !== document.body) {
              const count = parentCounts.get(parent) ?? 0;
              parentCounts.set(parent, count + 1);
              parent = parent.parentElement;
            }
          });

          let maxCount = 0;
          let bestParent: Element | null = null;
          parentCounts.forEach((count, parent) => {
            if (count > maxCount) {
              maxCount = count;
              bestParent = parent;
            }
          });
          contentElement = bestParent;
        }
      }
      contentElement ??= document.body;

      // Remove unwanted elements
      const unwantedSelectors = [
        "script",
        "style",
        "nav",
        "header",
        "footer",
        ".sidebar",
        ".navigation",
        ".menu",
        ".ads",
        ".advertisement",
        ".social-share",
        ".comments",
        ".related-posts",
        ".author-bio",
      ];
      unwantedSelectors.forEach((selector) => {
        contentElement.querySelectorAll(selector).forEach((el) => el.remove());
      });

      const htmlContent = contentElement.innerHTML;
      let markdownContent = turndownService.turndown(htmlContent);
      markdownContent = markdownContent
        .replace(/\n{3,}/g, "\n\n")
        .replace(/^(?:\s+|\s+)$/g, "")
        .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, "")
        .trim();

      const articleContent: ArticleContent = {
        title,
        content: markdownContent,
        url,
        extractedAt: new Date().toISOString(),
      };

      return JSON.stringify(articleContent, null, 2);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new UserError(`Failed to fetch article content: ${message}`);
    }
  },
});

const transportType = process.env.TRANSPORT || "stdio";
console.error(`RSS Reader MCP server running on ${transportType}`);

if (transportType === "httpStream") {
  const port = Number(process.env.PORT || 8081);
  server.start({
    transportType,
    httpStream: {
      host: process.env.MCP_SERVER_HOST || "localhost", // if run in Docker, set to "0.0.0.0"
      port,
    },
  });
} else {
  server.start({
    transportType: "stdio",
  });
}
