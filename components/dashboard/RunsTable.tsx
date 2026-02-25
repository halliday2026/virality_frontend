"use client";

import { formatDistanceToNow } from "date-fns";
import { Download, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { Run, RunStatus } from "@/types/api";

const STATUS_VARIANT: Record<RunStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  scraping: "secondary",
  analyzing: "secondary",
  generating: "secondary",
  complete: "default",
  error: "destructive",
};

const ACTIVE_STATUSES: RunStatus[] = ["pending", "scraping", "analyzing", "generating"];

function progress(run: Run): number {
  if (run.status === "complete") return 100;
  if (run.total_posts === 0) return 0;
  return Math.round((run.posts_analyzed / run.total_posts) * 100);
}

export function RunsTable() {
  const [runs, setRuns] = useState<Run[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch("/api/runs");
      if (!res.ok) throw new Error(await res.text());
      const data: Run[] = await res.json();
      setRuns(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load runs");
    }
  }, []);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  // Poll every 8 seconds if any runs are active
  useEffect(() => {
    if (!runs) return;
    const hasActive = runs.some((r) => ACTIVE_STATUSES.includes(r.status));
    if (!hasActive) return;
    const id = setInterval(fetchRuns, 8000);
    return () => clearInterval(id);
  }, [runs, fetchRuns]);

  if (error) {
    return (
      <p className="text-sm text-red-600">
        Failed to load runs: {error}
      </p>
    );
  }

  if (!runs) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-8 text-center">
        No runs yet. Click &ldquo;New Analysis&rdquo; to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">Run ID</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Progress</th>
            <th className="px-4 py-3 text-left">Cost</th>
            <th className="px-4 py-3 text-left">Started</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {runs.map((run) => (
            <tr key={run.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs">{run.id.slice(0, 8)}</td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[run.status]}>{run.status}</Badge>
              </td>
              <td className="px-4 py-3 w-40">
                {ACTIVE_STATUSES.includes(run.status) ? (
                  <div className="space-y-1">
                    <Progress value={progress(run)} className="h-2" />
                    <span className="text-xs text-gray-500">
                      {run.posts_analyzed}/{run.total_posts} posts
                    </span>
                  </div>
                ) : run.status === "complete" ? (
                  <span className="text-xs text-gray-600">
                    {run.posts_analyzed} posts
                  </span>
                ) : (
                  <span className="text-xs text-red-500 truncate max-w-xs block">
                    {run.error_message ?? "—"}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">
                ${run.cost_estimate_usd.toFixed(4)}
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                <Link href={`/runs/${run.id}`}>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </Link>
                {run.status === "complete" && (
                  <a href={`/api/download/${run.id}`}>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Excel
                    </Button>
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 border-t flex justify-end">
        <Button size="sm" variant="ghost" onClick={fetchRuns}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
