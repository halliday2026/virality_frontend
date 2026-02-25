import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { Run, RunStatus } from "@/types/api";

const STATUS_LABEL: Record<RunStatus, string> = {
  pending: "Queued",
  scraping: "Scraping posts…",
  analyzing: "Analyzing with Claude…",
  generating: "Generating report…",
  complete: "Complete",
  error: "Failed",
};

const STATUS_VARIANT: Record<RunStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  scraping: "secondary",
  analyzing: "secondary",
  generating: "secondary",
  complete: "default",
  error: "destructive",
};

function progressValue(run: Run): number {
  if (run.status === "complete") return 100;
  if (run.total_posts === 0) return 0;
  return Math.round((run.posts_analyzed / run.total_posts) * 100);
}

export function RunProgress({ run }: { run: Run }) {
  const pct = progressValue(run);
  const isActive = !["complete", "error"].includes(run.status);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge variant={STATUS_VARIANT[run.status]}>
          {STATUS_LABEL[run.status]}
        </Badge>
        <span className="text-sm text-gray-500">
          {run.sources_completed}/{run.total_sources} sources complete
        </span>
      </div>

      {isActive && (
        <div className="space-y-1">
          <Progress value={pct} className="h-2" />
          <p className="text-xs text-gray-500">
            {run.posts_scraped} scraped · {run.posts_analyzed} analyzed ·{" "}
            {pct}%
          </p>
        </div>
      )}

      {run.status === "error" && run.error_message && (
        <p className="text-sm text-red-600 bg-red-50 rounded p-3">
          {run.error_message}
        </p>
      )}

      <Separator />

      <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
        <div>
          <dt className="text-gray-500">Posts scraped</dt>
          <dd className="font-medium">{run.posts_scraped}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Posts analyzed</dt>
          <dd className="font-medium">{run.posts_analyzed}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Estimated cost</dt>
          <dd className="font-medium">${run.cost_estimate_usd.toFixed(4)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Run ID</dt>
          <dd className="font-mono text-xs text-gray-600">{run.id}</dd>
        </div>
      </dl>
    </div>
  );
}
