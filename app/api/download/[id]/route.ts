import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const API_URL = process.env.API_URL || "http://localhost:8000";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Stream the file from FastAPI through to the browser, forwarding the auth token
  const upstream = await fetch(`${API_URL}/download/${id}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Download failed: ${upstream.statusText}` },
      { status: upstream.status }
    );
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="virality_report_${id.slice(0, 8)}.xlsx"`,
    },
  });
}
