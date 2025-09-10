export interface RSSFeedEntry {
  title: string;
  link: string;
  pubDate?: string;
  creator?: string;
  summary?: string;
  categories?: string[];
  guid?: string;
}

export interface FeedInfo {
  title: string;
  description?: string;
  link: string;
  lastBuildDate?: string;
  entries: RSSFeedEntry[];
}

export interface FetchFeedArgs {
  url: string;
  limit?: number;
}

export interface FetchArticleArgs {
  url: string;
}

export interface ArticleContent {
  title: string;
  content: string;
  url: string;
  extractedAt: string;
}
