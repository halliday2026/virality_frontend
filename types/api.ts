export type RunStatus =
  | "pending"
  | "scraping"
  | "analyzing"
  | "generating"
  | "complete"
  | "error";

export interface SourceConfig {
  platform: string;
  apify_actor_id: string;
  actor_input: Record<string, unknown>;
}

export interface AnalyzeRequest {
  sources: SourceConfig[];
  time_window: string;
  max_posts_per_source: number;
}

export interface AnalyzeResponse {
  run_id: string;
  status: string;
  message: string;
}

export interface Run {
  id: string;
  status: RunStatus;
  config: string;
  sources_completed: number;
  total_sources: number;
  posts_scraped: number;
  posts_analyzed: number;
  total_posts: number;
  error_message: string | null;
  spreadsheet_path: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  cost_estimate_usd: number;
}

export interface SummaryResponse {
  run_id: string;
  time_window: string;
  summary: string;
}

export interface HealthResponse {
  status: string;
  anthropic_connected: boolean;
  apify_connected: boolean;
  database_ok: boolean;
}
