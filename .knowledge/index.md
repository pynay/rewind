# System Knowledge Base

Last updated: 2026-04-12T20:24:32.926Z
Total entries: 5
Modules: 5

## Modules

### api/fork
- Implemented POST /api/fork route — core fork-and-rewind feature (2026-04-12) — `005c550c-95c7-453b-b429-9a081b0f2b1c`

### api-routes
- Implemented GET /api/sessions/[sessionId]/[agentSessionId]/messages route (2026-04-12) — `8402211f-de1c-41aa-ac6d-77c348c55018`

### api/sessions
- Implemented GET /api/sessions route proxying to Omnara session detail (2026-04-12) — `7896eb7d-5225-457a-8627-4df91b437422`

### lib/messageMapper
- Transforms GET messages format to import-claude-session format (2026-04-12) — `77b03485-a678-45d7-98b1-33f19015c3d1`

### lib/omnara
- Server-side Omnara API client with typed fetch wrapper (2026-04-12) — `67f1d3aa-8f6b-406b-bab1-574da805ee74`

## Assumptions (all)

- api/fork: getAgentSessionMessages pagination uses after_id cursor with has_more flag
- api/fork: importClaudeSession returns user_session_id and agent_session_id on success
- api/fork: launchWorkspaceSession accepts resume_session_id to continue from imported session
- api-routes: Omnara API response shape matches MessagesResponse type
- api-routes: No auth needed beyond server-side OMNARA_API_TOKEN
- lib/messageMapper: payload.content shape from GET messages matches ImportMessageContent shape expected by import endpoint
- lib/messageMapper: system messages should be dropped rather than mapped
- lib/omnara: Omnara API response shapes match docs as of 2026-04-12
- lib/omnara: payload.content from GET messages has compatible shape with import content field
