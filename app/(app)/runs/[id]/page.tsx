import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RunDetailClient } from "@/components/runs/RunDetailClient";
import { fastapi } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export default async function RunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) notFound();

  let run;
  try {
    run = await fastapi.getStatus(id, session.access_token);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to dashboard
      </Link>
      <RunDetailClient runId={id} initialRun={run} />
    </div>
  );
}
