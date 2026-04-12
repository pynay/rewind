import { NextRequest, NextResponse } from "next/server";

import {
  getAgentSessionMessages,
  importClaudeSession,
  launchWorkspaceSession,
} from "@/lib/omnara";
import { mapMessagesForImport } from "@/lib/messageMapper";

// ---------------------------------------------------------------------------
// POST /api/fork
//
// Creates a "fork" of an existing agent session:
//   1. Fetch full message history (paginated)
//   2. Truncate at fork_after_index
//   3. Transform messages to import format
//   4. Import as a new session via import-claude-session
//   5. Launch a new sandbox with the correction prompt
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // Step 1 — Parse and validate request body
  const body = await request.json();

  const requiredFields = [
    "workspace_id",
    "session_id",
    "agent_session_id",
    "fork_after_index",
    "correction_prompt",
  ] as const;

  for (const field of requiredFields) {
    if (body[field] == null) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  const {
    workspace_id,
    session_id,
    agent_session_id,
    fork_after_index,
    correction_prompt,
  } = body as {
    workspace_id: string;
    session_id: string;
    agent_session_id: string;
    fork_after_index: number;
    correction_prompt: string;
  };

  try {
    // Step 2 — Fetch full message history (paginated, 200 per page)
    const allMessages = [];
    let afterId: string | undefined;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const page = await getAgentSessionMessages(session_id, agent_session_id, {
        limit: 200,
        after_id: afterId,
      });

      allMessages.push(...page.messages);

      if (!page.has_more) break;

      // Use the last message's ID as the cursor for the next page
      afterId = page.messages[page.messages.length - 1].message_id;
    }

    // Step 3 — Truncate at fork_after_index (inclusive) and transform
    const truncated = allMessages.slice(0, fork_after_index + 1);
    const mappedMessages = mapMessagesForImport(truncated);

    // Step 4 — Import the truncated session
    // Use a unique ID per fork so each import creates a fresh session
    // (Omnara deduplicates on claude_session_id/provider_session_id)
    const forkId = crypto.randomUUID();
    const importResult = await importClaudeSession({
      workspace_id,
      claude_session_id: forkId,
      provider_session_id: forkId,
      messages: mappedMessages,
      session_name: null,
    });

    if (!importResult.success || !importResult.user_session_id) {
      throw new Error(
        importResult.error ?? "Import failed with no error message"
      );
    }

    // Step 5 — Launch a new session with the correction prompt
    await launchWorkspaceSession(workspace_id, {
      user_session_id: importResult.user_session_id,
      agent_session_id: importResult.agent_session_id,
      initial_prompt:
        "The workspace is freshly cloned from the latest checkpoint. Re-apply the changes we discussed in our conversation so far, then: " +
        correction_prompt,
    });

    // Step 6 — Return success
    return NextResponse.json({
      success: true,
      fork_session_id: importResult.user_session_id,
      fork_agent_session_id: importResult.agent_session_id,
    });
  } catch (err) {
    console.error("[fork] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
