import { NextRequest, NextResponse } from "next/server";
import { getSessionDetail } from "@/lib/omnara";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId query param required" },
      { status: 400 }
    );
  }

  try {
    const data = await getSessionDetail(sessionId);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[sessions] failed to fetch session detail:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
