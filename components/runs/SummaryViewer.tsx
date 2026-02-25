"use client";

import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import type { SummaryResponse } from "@/types/api";

export function SummaryViewer({ runId }: { runId: string }) {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/summary/${runId}`);
        if (!res.ok) throw new Error(await res.text());
        setData(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load summary");
      }
    }
    load();
  }, [runId]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;

  if (!data) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    );
  }

  return (
    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-sans">
      {data.summary}
    </pre>
  );
}
