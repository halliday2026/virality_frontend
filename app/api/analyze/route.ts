import { NextResponse } from "next/server";

import { fastapi } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const result = await fastapi.analyze(body, session.access_token);
    return NextResponse.json(result, { status: 202 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Backend unavailable";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
