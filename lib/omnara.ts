/**
 * Omnara API client — server-side only.
 *
 * Wraps fetch with auth headers and base URL. Every Omnara call in the app
 * goes through this module so we have a single place to log, retry, or
 * adjust when the (unstable) API changes shape.
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_TOKEN = () => {
  const t = process.env.OMNARA_API_TOKEN;
  if (!t) throw new Error("OMNARA_API_TOKEN is not set");
  return t;
};

const BASE = () =>
  (process.env.OMNARA_API_URL ?? "https://api.omnara.com") + "/api/v1";

// ---------------------------------------------------------------------------
// Types — GET /user-sessions/{id} (session detail)
// ---------------------------------------------------------------------------

export interface UserSession {
  kind: "user_session";
  session_id: string;
  user_id: string;
  status: "ACTIVE" | "COMPLETED" | "DELETED";
  created_at: string;
  name: string | null;
  metadata: Record<string, unknown> | null;
  settings: SessionSettings | null;
  worktree_id: string | null;
  worktree_name: string | null;
  worktree_type: "LOCAL" | "REMOTE" | null;
}

export interface AgentSession {
  kind: "agent_session";
  session_id: string;
  user_session_id: string | null;
  parent_session_id: string | null;
  session_type: "CODE" | "VOICE";
  connection_status: "CONNECTED" | "DISCONNECTED";
  work_status: "IDLE" | "WORKING" | "COMPLETED";
  daemon_version: string | null;
  metadata: Record<string, unknown> | null;
  settings: SessionSettings | null;
}

export interface SessionSettings {
  code?: {
    mode?: "agent" | "orchestrator" | null;
    default_provider?: string | null;
    providers?: Record<string, unknown>;
  };
  voice?: { language?: string | null };
}

export interface Workspace {
  id: string;
  user_id: string;
  git_host: string | null;
  git_path: string | null;
  workspace_metadata: Record<string, unknown> | null;
  workspace_config: Record<string, unknown>;
  user_machine_paths: { user_machine_id: string; local_path: string }[];
  created_at: string;
  updated_at: string;
}

export interface Worktree {
  id: string;
  workspace_id: string;
  name: string | null;
  is_main: boolean;
  worktree_type: "LOCAL" | "REMOTE" | null;
  created_at: string;
  updated_at: string;
}

export interface SessionDetailResponse {
  session: UserSession;
  agent_sessions: AgentSession[];
  workspace: Workspace | null;
  worktree: Worktree | null;
}

// ---------------------------------------------------------------------------
// Types — GET /user-sessions (list)
// ---------------------------------------------------------------------------

export interface ListSessionsResponse {
  sessions: UserSession[];
  has_more: boolean;
  next_cursor: string | null;
}

// ---------------------------------------------------------------------------
// Types — GET /user-sessions/{id}/agent-sessions/{id}/messages
// ---------------------------------------------------------------------------

export interface MessageSender {
  kind: "user" | "agent_session" | "system";
  id: string | null;
}

export interface AgentMessage {
  message_id: string;
  session_id: string;
  sender: MessageSender;
  payload: {
    version: number;
    content: Record<string, unknown>;
    metadata: Record<string, unknown> | null;
  };
  metadata: Record<string, unknown> | null;
  created_at: string;
  delivery_mode: "queued" | "inline" | null;
  delivered_at: string | null;
  canceled_at: string | null;
}

export interface MessagesResponse {
  messages: AgentMessage[];
  has_more: boolean;
  next_cursor: string | null;
}

// ---------------------------------------------------------------------------
// Types — POST /user-sessions/import-claude-session
// ---------------------------------------------------------------------------

export interface ImportMessageContent {
  type: "text" | "tool_call" | "tool_result" | "agent_complete";
  text?: string | null;
  name?: string | null;
  tool_use_id?: string | null;
  arguments?: Record<string, unknown> | null;
  output?: unknown | null;
  is_error?: boolean | null;
  success?: boolean | null;
  message?: string | null;
}

export interface ImportMessage {
  message_id: string;
  role: "user" | "assistant";
  content: ImportMessageContent;
  created_at: string;
  metadata?: Record<string, unknown> | null;
}

export interface ImportSessionRequest {
  workspace_id: string;
  worktree_name?: string | null;
  claude_session_id: string;
  provider_session_id: string;
  messages: ImportMessage[];
  session_name?: string | null;
}

export interface ImportSessionResponse {
  success: boolean;
  user_session_id: string | null;
  agent_session_id: string | null;
  message_count: number;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Types — POST /workspaces/{id}/sessions (launch)
// ---------------------------------------------------------------------------

export interface LaunchSessionRequest {
  machine_id?: string | null;
  user_session_id?: string | null;
  metadata?: Record<string, unknown> | null;
  initial_prompt?: string | null;
  worktree_name?: string | null;
  session_settings?: SessionSettings | null;
  resume_session_id?: string | null;
  agent_session_id?: string | null;
}

export interface LaunchSessionResponse {
  status: string;
  payload: Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Types — POST /user-sessions (create)
// ---------------------------------------------------------------------------

export interface CreateSessionRequest {
  worktree_id?: string | null;
  workspace_id?: string | null;
  name?: string | null;
  metadata?: Record<string, unknown> | null;
  start_sandbox?: boolean;
  session_settings?: SessionSettings | null;
  initial_message?: string | null;
}

// ---------------------------------------------------------------------------
// Internal fetch wrapper
// ---------------------------------------------------------------------------

async function omnaraFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${BASE()}${path}`;
  const method = init?.method ?? "GET";

  console.log(`[omnara] ${method} ${url}`);

  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_TOKEN()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = await res.text();

  if (!res.ok) {
    console.error(`[omnara] ${res.status} ${res.statusText}`, body);
    throw new Error(`Omnara API error ${res.status}: ${body}`);
  }

  const json = JSON.parse(body) as T;
  console.log(`[omnara] ${method} ${url} -> ${res.status}`);
  return json;
}

// ---------------------------------------------------------------------------
// Exported API functions
// ---------------------------------------------------------------------------

/** GET /api/v1/user-sessions/{id} — session detail with agent sessions */
export async function getSessionDetail(
  userSessionId: string
): Promise<SessionDetailResponse> {
  return omnaraFetch(`/user-sessions/${userSessionId}`);
}

/** GET /api/v1/user-sessions/{id}/agent-sessions/{id}/messages */
export async function getAgentSessionMessages(
  userSessionId: string,
  agentSessionId: string,
  params?: { limit?: number; before_id?: string; after_id?: string }
): Promise<MessagesResponse> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.before_id) qs.set("before_id", params.before_id);
  if (params?.after_id) qs.set("after_id", params.after_id);
  const q = qs.toString();

  return omnaraFetch(
    `/user-sessions/${userSessionId}/agent-sessions/${agentSessionId}/messages${q ? `?${q}` : ""}`
  );
}

/** POST /api/v1/user-sessions/import-claude-session */
export async function importClaudeSession(
  body: ImportSessionRequest
): Promise<ImportSessionResponse> {
  return omnaraFetch("/user-sessions/import-claude-session", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** POST /api/v1/workspaces/{id}/sessions — launch a workspace session */
export async function launchWorkspaceSession(
  workspaceId: string,
  body: LaunchSessionRequest
): Promise<LaunchSessionResponse> {
  return omnaraFetch(`/workspaces/${workspaceId}/sessions`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** POST /api/v1/user-sessions — create a new user session */
export async function createUserSession(
  body: CreateSessionRequest
): Promise<SessionDetailResponse> {
  return omnaraFetch("/user-sessions", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /api/v1/user-sessions — list recent user sessions */
export async function listUserSessions(params?: {
  limit?: number;
  cursor?: string;
  status?: "ACTIVE" | "COMPLETED" | "DELETED";
}): Promise<ListSessionsResponse> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.cursor) qs.set("cursor", params.cursor);
  if (params?.status) qs.set("status", params.status);
  const q = qs.toString();
  return omnaraFetch(`/user-sessions${q ? `?${q}` : ""}`);
}
