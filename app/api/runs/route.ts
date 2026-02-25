import { NextResponse } from "next/server";

import { fastapi } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? 50);

  try {
    const runs = await fastapi.listRuns(session.access_token, limit);
    return NextResponse.json(runs);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Backend unavailable";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
