import { NextRequest, NextResponse } from "next/server";
import {
  createUserSession,
  getSessionDetail,
  launchWorkspaceSession,
} from "@/lib/omnara";

// ---------------------------------------------------------------------------
// POST /api/launch
//
// Creates a new Omnara session from a prompt and launches an agent.
// Used by the "New idea" launcher on the home page.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const body = await request.json();
  const prompt = body.prompt as string | undefined;

  if (!prompt?.trim()) {
    return NextResponse.json(
      { error: "Missing required field: prompt" },
      { status: 400 }
    );
  }

  const workspaceId =
    (body.workspace_id as string | undefined) ??
    process.env.OMNARA_WORKSPACE_ID;

  if (!workspaceId) {
    return NextResponse.json(
      { error: "No workspace_id provided and OMNARA_WORKSPACE_ID is not set" },
      { status: 400 }
    );
  }

  try {
    // Step 1 — Create user session with the prompt as name + initial message
    const session = await createUserSession({
      workspace_id: workspaceId,
      name: prompt.trim().slice(0, 60),
      initial_message: prompt.trim(),
    });

    const userSessionId = session.session.session_id;

    // Step 2 — If an agent session was created automatically, use it.
    // Otherwise launch one explicitly.
    let agentSessionId = "";

    if (session.agent_sessions.length > 0) {
      agentSessionId = session.agent_sessions[0].session_id;
    } else {
      await launchWorkspaceSession(workspaceId, {
        user_session_id: userSessionId,
        initial_prompt: prompt.trim(),
      });

      // The agent session takes a moment to appear after launch.
      // Poll session detail up to 5 times with 1s delays.
      let found = false;
      for (let attempt = 0; attempt < 5; attempt++) {
        await new Promise((r) => setTimeout(r, 1000));
        const detail = await getSessionDetail(userSessionId);
        if (detail.agent_sessions.length > 0) {
          agentSessionId = detail.agent_sessions[0].session_id;
          found = true;
          break;
        }
      }

      if (!found) {
        throw new Error("Session created but no agent session was launched");
      }
    }

    return NextResponse.json({
      success: true,
      session_id: userSessionId,
      agent_session_id: agentSessionId,
    });
  } catch (err) {
    console.error("[launch] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
