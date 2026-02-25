"use client";

import { Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { RunProgress } from "@/components/runs/RunProgress";
import { SummaryViewer } from "@/components/runs/SummaryViewer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Run } from "@/types/api";

const TERMINAL_STATUSES = ["complete", "error"];

export function RunDetailClient({ runId, initialRun }: { runId: string; initialRun: Run }) {
  const [run, setRun] = useState<Run>(initialRun);

  const fetchRun = useCallback(async () => {
    try {
      const res = await fetch(`/api/status/${runId}`);
      if (res.ok) setRun(await res.json());
    } catch {
      // Swallow — keep showing last known state
    }
  }, [runId]);

  useEffect(() => {
    if (TERMINAL_STATUSES.includes(run.status)) return;
    const id = setInterval(fetchRun, 3000);
    return () => clearInterval(id);
  }, [run.status, fetchRun]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Run {runId.slice(0, 8)}</CardTitle>
            <CardDescription className="mt-1">
              Started{" "}
              {new Date(run.created_at).toLocaleString()}
            </CardDescription>
          </div>
          {run.status === "complete" && (
            <a href={`/api/download/${runId}`}>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download Excel
              </Button>
            </a>
          )}
        </CardHeader>
        <CardContent>
          <RunProgress run={run} />
        </CardContent>
      </Card>

      {run.status === "complete" && (
        <Card>
          <CardHeader>
            <CardTitle>Intelligence Report</CardTitle>
            <CardDescription>
              Claude-generated pattern analysis for this run
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SummaryViewer runId={runId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
