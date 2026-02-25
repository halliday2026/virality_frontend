/**
 * Server-side FastAPI proxy client.
 * API_URL has no NEXT_PUBLIC_ prefix — never exposed to the browser.
 * token: the Supabase access_token forwarded from the route handler so FastAPI can verify it.
 */
import type { AnalyzeRequest, AnalyzeResponse, Run, SummaryResponse } from "@/types/api";

const API_URL = process.env.API_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const fastapi = {
  analyze: (body: AnalyzeRequest, token: string) =>
    apiFetch<AnalyzeResponse>("/analyze", token, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getStatus: (runId: string, token: string) =>
    apiFetch<Run>(`/status/${runId}`, token),

  listRuns: (token: string, limit = 50) =>
    apiFetch<Run[]>(`/runs?limit=${limit}`, token),

  getSummary: (runId: string, token: string) =>
    apiFetch<SummaryResponse>(`/summary/${runId}`, token),
};
