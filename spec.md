# Rewind — Mobile-First Agent Session Forking for Omnara

## One-liner

A mobile web app that lets you visually rewind, fork, and compare coding agent sessions from your phone — even when your laptop is closed.

## Problem

When an AI coding agent goes off the rails midway through a task, your options suck:

- **Claude Code's** `/rewind` works but is terminal-only. If you're away from your laptop, you're out of luck.
- **Omnara** lets you monitor and chat with sessions from your phone, but has no rewind or forking capability.
- **Dispatch (Claude Cowork)** lets you launch coding sessions from your phone, but hides the agent's decision process entirely — you only see results. No ability to inspect, rewind, or branch. Also requires your laptop to be awake.

Nobody offers: **mobile-first visual rewind + parallel forking in cloud sandboxes.**

## What it does

You open the app on your phone. You see a timeline of your agent's decisions. You tap the node where it went wrong. You type a correction. A new sandbox spins up with the fix. You compare the original and the fork side by side. Your laptop can be closed the entire time.

---

## How the Omnara API Actually Supports This

### The Forking Hack (import-claude-session)

`resume_session_id` only resumes from the **end** of a session — not from an arbitrary mid-session point. But `import-claude-session` gives us a workaround:

1. **Fetch** the full message history from the original session via `GET /api/v1/user-sessions/{id}/agent-sessions/{id}/messages`
2. **Truncate** the messages array at the fork point (keep messages 1–5, drop 6+)
3. **Import** the truncated array via `POST /api/v1/user-sessions/import-claude-session` — this creates a new session whose context ends at step 5
4. **Launch** a new session using that `agent_session_id` as the `resume_session_id`, with the user's corrected prompt as `initial_message`
5. The agent picks up from step 5's context with the new instruction, running in a remote sandbox

### Key Constraint: Conversation vs. File State

This approach restores **conversation context only, not file state**. The worktree/checkpoint system handles files separately. For the hackathon:

- Fork into a **fresh remote sandbox** that restores from the last synced workspace checkpoint
- The agent re-applies file changes guided by the imported conversation context + the corrected prompt
- Include explicit instruction in the correction prompt: "The workspace is freshly cloned. Re-apply necessary changes based on our conversation so far, then \[correction\]."

### Pivot Plan (if import hack fails)

If `import-claude-session` can't handle truncated arrays, fall back to:

1. Fetch messages up to fork point
2. Summarize the conversation so far into a single prompt
3. Launch a brand new Omnara session with that summary as the `initial_message`
4. Less precise but still demo-able

---

## API Calls Used

| Action | Endpoint | Method |
| --- | --- | --- |
| List sessions | `/api/v1/user-sessions/{id}` | GET |
| Get messages | `/api/v1/user-sessions/{id}/agent-sessions/{id}/messages` | GET |
| Import truncated session | `/api/v1/user-sessions/import-claude-session` | POST |
| Create new session from fork | `/api/v1/user-sessions` | POST |
| Launch in sandbox | `/api/v1/workspaces/{id}/sessions` | POST |

---

## Scope

### Must have

- View a session's message history as a visual timeline on mobile
- Tap a node and fork from that point with a new prompt
- See the forked session appear as a branch
- Show the fork running in a remote sandbox

### Nice to have

- Side-by-side diff of branch outputs
- Multiple forks from the same point
- Status polling with live message streaming on fork branch

### Out of scope

- File-level checkpoint restore
- Native mobile app
- Merging branches back together

---

## Demo Script (2 minutes)

1. **Setup** (15s): "I asked my coding agent to add authentication to an Express app. It ran for 10 minutes in a cloud sandbox and chose Passport.js. I wanted JWT. I'm on my phone."

2. **Show the timeline** (20s): Open the app on phone. Scroll through the decision tree. "Here's every message in the session. I can see at step 4 it decided to install Passport."

3. **Fork** (30s): Tap step 3 (before the bad decision). Type "use jsonwebtoken for JWT auth, not Passport." Hit fork. "A new sandbox just spun up. The agent has all the context from steps 1–3 but now it's following my corrected instruction."

4. **Compare** (30s): Show both branches. The fork is running, messages streaming in. "It's reusing the understanding from the first 3 steps — the codebase analysis, the route structure — but going down the right path this time."

5. **Result** (15s): "Fork finished. I can review it here or jump to the Omnara dashboard to create a PR. I never opened my laptop."

---

## Risks

| Risk | Mitigation |
| --- | --- |
| `import-claude-session` rejects truncated arrays | Test first. Pivot to summary prompt approach if needed. |
| File state mismatch after fork | Explicit instruction in correction prompt to re-apply from clean state |
| Sandbox spin-up is slow | Pre-warm a sandbox before demo |
| Message format mismatch between GET and import endpoints | Inspect both schemas early, write mapper |
| API is unstable | Recorded backup demo |
