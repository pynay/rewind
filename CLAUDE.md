## kbase

**kbase MCP tools are required for all work in this project.**

1. Before reading, analyzing, or modifying any source file, call `read_knowledge({ target: <file or module> })` first.

2. Before refactors spanning multiple modules, also call `query_deps({ module: <module> })`.

3. After any non-trivial change or decision, call `write_knowledge` to record it.\
   \
   \
   [CLAUDE.md](http://CLAUDE.md)

   ## Project: Rewind

   Mobile-first web app for visually rewinding and forking Omnara coding agent sessions from your phone.

   ## Tech Stack

   - **Framework**: Next.js 15 (App Router)
   - **Styling**: Tailwind CSS 4
   - **Language**: TypeScript
   - **No database** — in-memory state only
   - **No auth UI** — Omnara PAT is set via environment variable

   ## Project Structure

   ```
   rewind/
   ├── app/
   │   ├── layout.tsx
   │   ├── page.tsx                        # Session list (home)
   │   ├── session/
   │   │   └── [sessionId]/
   │   │       └── [agentSessionId]/
   │   │           └── page.tsx            # Timeline view for a session
   │   ├── api/
   │   │   ├── sessions/
   │   │   │   └── route.ts               # GET — list sessions from Omnara
   │   │   ├── sessions/
   │   │   │   └── [sessionId]/
   │   │   │       └── [agentSessionId]/
   │   │   │           └── messages/
   │   │   │               └── route.ts   # GET — fetch message history
   │   │   └── fork/
   │   │       └── route.ts               # POST — truncate + import + launch fork
   ├── components/
   │   ├── Timeline.tsx                    # Vertical scrollable session timeline
   │   ├── TimelineNode.tsx                # Individual message node (tappable)
   │   ├── ForkModal.tsx                   # Bottom sheet: correction prompt input
   │   ├── BranchView.tsx                  # Side-by-side branch comparison
   │   ├── SessionCard.tsx                 # Session list item
   │   └── StatusBadge.tsx                 # Running/completed/failed indicator
   ├── lib/
   │   ├── omnara.ts                       # Omnara API client (server-side only)
   │   └── messageMapper.ts               # Transform GET messages → import format
   ├── hooks/
   │   ├── useMessages.ts                  # Fetch + cache session messages
   │   └── usePollFork.ts                  # Poll forked session for new messages
   ├── CLAUDE.md
   ├── spec.md
   ├── .env.local.example
   ├── next.config.ts
   ├── tailwind.config.ts
   ├── tsconfig.json
   └── package.json
   
   ```

   ## Environment Variables (.env.local)

   ```
   OMNARA_API_TOKEN=        # Personal Access Token from Omnara dashboard
   OMNARA_API_URL=https://api.omnara.com
   
   ```

   ## Commands

   ```bash
   npm install
   npm run dev     # runs on localhost:3000
   
   ```

   ## API Routes

   ### GET /api/sessions

   Proxies to Omnara. Returns list of user sessions.

   ### GET /api/sessions/\[sessionId\]/\[agentSessionId\]/messages

   Proxies to Omnara. Returns message history for a specific agent session.

   ### POST /api/fork

   Request body:

   ```json
   {
     "workspace_id": "string",
     "session_id": "string",
     "agent_session_id": "string",
     "fork_after_index": 5,
     "correction_prompt": "use JWT instead of Passport"
   }
   
   ```

   What it does:

   1. Fetches full message history from Omnara
   2. Truncates messages array at `fork_after_index`
   3. Calls Omnara's `import-claude-session` with truncated messages
   4. Launches a new session with `resume_session_id` set to the imported session's `agent_session_id`, and `initial_message` set to the correction prompt prefixed with: "The workspace is freshly cloned from the latest checkpoint. Re-apply the changes we discussed in our conversation so far, then: "
   5. Returns `{ success, fork_session_id, fork_agent_session_id }`

   ## Omnara API Reference

   Base URL: `https://api.omnara.com` Auth: `Authorization: Bearer <OMNARA_API_TOKEN>` All endpoints prefixed with `/api/v1`

   Key endpoints we use:

   - `GET /api/v1/user-sessions/{id}` — session detail
   - `GET /api/v1/user-sessions/{id}/agent-sessions/{id}/messages` — message history
   - `POST /api/v1/user-sessions/import-claude-session` — import messages into new session
   - `POST /api/v1/workspaces/{id}/sessions` — launch workspace session
   - `POST /api/v1/user-sessions` — create user session

   Full API docs: https://docs.omnara.com/api-reference/overview

   ## Frontend Design Rules

   - **Mobile-first**: Design for 390px width (iPhone), scale up
   - **Touch targets**: Minimum 44x44px for all tappable elements
   - **Timeline direction**: Vertical, newest at bottom, scrollable
   - **Color coding**:
     - User messages: blue-500 left border
     - Agent messages: gray-400 left border
     - Tool use/results: amber-400 left border
     - Fork point: purple-500 highlight
     - Fork branch: purple-500 left border, indented
   - **Fork modal**: Bottom sheet pattern (slides up from bottom)
   - **No desktop-specific layouts** — this is a phone app
   - **Dark mode default** — dark backgrounds, light text

   ## Critical Implementation Notes

   - The `import-claude-session` endpoint is the core hack. Test it FIRST with a truncated message array before building anything else. If it rejects truncated arrays, pivot to the summary prompt approach (see spec.md Pivot Plan).
   - Message format from `get-agent-session-messages` may not exactly match what `import-claude-session` expects. Build `messageMapper.ts` to transform between formats.
   - Omnara's API is marked "unstable" — responses may differ from docs. Log everything.
   - The Omnara client (`lib/omnara.ts`) is server-side only. Never import it in client components. All Omnara calls go through our API routes.
   - Poll forked sessions every 5 seconds for new messages. Don't poll faster.
   - The fork only restores conversation context, NOT file state. The correction prompt must include instructions to re-apply from a clean workspace.

   ## What NOT to Build

   - No auth/login UI — PAT is in env
   - No database — everything in memory
   - No native mobile — responsive web app
   - No file-level checkpoint restore — conversation-only forking
   - No branch merging
   - No settings or configuration screens
   - No onboarding flow