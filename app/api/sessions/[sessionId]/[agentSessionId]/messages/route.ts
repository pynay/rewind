import { NextRequest, NextResponse } from "next/server";
import { getAgentSessionMessages } from "@/lib/omnara";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; agentSessionId: string }> }
) {
  const { sessionId, agentSessionId } = await params;

  // Parse optional pagination query params
  const searchParams = request.nextUrl.searchParams;

  const rawLimit = searchParams.get("limit");
  let limit = 50;
  if (rawLimit !== null) {
    const parsed = parseInt(rawLimit, 10);
    if (!Number.isNaN(parsed)) {
      limit = Math.max(1, Math.min(200, parsed));
    }
  }

  const before_id = searchParams.get("before_id") ?? undefined;
  const after_id = searchParams.get("after_id") ?? undefined;

  // Build params object, omitting undefined keys
  const queryParams: { limit: number; before_id?: string; after_id?: string } =
    { limit };
  if (before_id !== undefined) queryParams.before_id = before_id;
  if (after_id !== undefined) queryParams.after_id = after_id;

  try {
    const data = await getAgentSessionMessages(
      sessionId,
      agentSessionId,
      queryParams
    );
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    console.error("[messages route]", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
