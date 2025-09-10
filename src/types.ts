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

// Type guards
export function isValidFetchFeedArgs(args: any): args is FetchFeedArgs {
  return (
    typeof args === 'object' &&
    args !== null &&
    typeof args.url === 'string' &&
    args.url.length > 0 &&
    (args.limit === undefined || (typeof args.limit === 'number' && args.limit > 0))
  );
}

export function isValidFetchArticleArgs(args: any): args is FetchArticleArgs {
  return (
    typeof args === 'object' &&
    args !== null &&
    typeof args.url === 'string' &&
    args.url.length > 0
  );
}
