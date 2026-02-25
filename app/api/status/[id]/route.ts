import { NextResponse } from "next/server";

import { fastapi } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const run = await fastapi.getStatus(id, session.access_token);
    return NextResponse.json(run);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Backend unavailable";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
