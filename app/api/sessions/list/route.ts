import { NextRequest, NextResponse } from "next/server";
import { listUserSessions } from "@/lib/omnara";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const rawLimit = sp.get("limit");
  const limit = rawLimit ? Math.min(50, Math.max(1, Number(rawLimit))) : 20;
  const cursor = sp.get("cursor") ?? undefined;
  const status = sp.get("status") as "ACTIVE" | "COMPLETED" | "DELETED" | undefined;

  try {
    const data = await listUserSessions({ limit, cursor, status });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[sessions/list]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
