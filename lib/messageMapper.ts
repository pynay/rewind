/**
 * Transforms messages from the GET agent-session-messages response format
 * into the format expected by POST import-claude-session.
 *
 * GET returns:
 *   { message_id, session_id, sender: { kind, id }, payload: { version, content, metadata }, created_at, ... }
 *
 * Import expects:
 *   { message_id, role: "user"|"assistant", content: { type, text, ... }, created_at, metadata }
 *
 * Key mappings:
 *   sender.kind "user"          -> role "user"
 *   sender.kind "agent_session" -> role "assistant"
 *   sender.kind "system"        -> filtered out (import only accepts user/assistant)
 *   payload.content.type "agent_progress" / "agent_complete" -> filtered out (status pings, not conversation)
 *   payload.content             -> content (passed through — shape already matches)
 */

import type { AgentMessage, ImportMessage, ImportMessageContent } from "./omnara";

function senderKindToRole(kind: string): "user" | "assistant" | null {
  switch (kind) {
    case "user":
      return "user";
    case "agent_session":
      return "assistant";
    default:
      // System messages and unknown kinds are dropped
      return null;
  }
}

/** Content types that are actual conversation turns, not status pings. */
const IMPORTABLE_CONTENT_TYPES = new Set(["text", "tool_call", "tool_result"]);

/** Map a single GET message to the import format. Returns null for non-importable messages. */
function mapOne(msg: AgentMessage): ImportMessage | null {
  const role = senderKindToRole(msg.sender.kind);
  if (!role) return null;

  const contentType = msg.payload.content?.type as string | undefined;
  if (!contentType || !IMPORTABLE_CONTENT_TYPES.has(contentType)) return null;

  return {
    message_id: crypto.randomUUID(),
    role,
    content: msg.payload.content as unknown as ImportMessageContent,
    created_at: msg.created_at,
    metadata: msg.metadata ?? msg.payload.metadata ?? null,
  };
}

/** Map an array of GET messages to import format, filtering out system messages. */
export function mapMessagesForImport(messages: AgentMessage[]): ImportMessage[] {
  const mapped: ImportMessage[] = [];
  for (const msg of messages) {
    const result = mapOne(msg);
    if (result) mapped.push(result);
  }
  return mapped;
}
