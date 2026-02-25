import { NewAnalysisDialog } from "@/components/dashboard/NewAnalysisDialog";
import { RunsTable } from "@/components/dashboard/RunsTable";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Analyze viral social media content patterns
          </p>
        </div>
        <NewAnalysisDialog />
      </div>
      <RunsTable />
    </div>
  );
}
