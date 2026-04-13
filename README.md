# Rewind

Rewind is a Next.js app for reviewing Omnara coding-agent sessions, launching new sessions, and forking an existing session from an earlier point in the conversation.

## What It Does

- Lists recent Omnara user sessions
- Opens a session timeline and message history
- Launches a brand-new session from a prompt
- Forks an existing session by truncating message history and relaunching from that point

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS v4

## Requirements

- Node.js 18+ recommended
- An Omnara API token
- An Omnara workspace ID if you want to launch new sessions from the UI

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the values locally:

```bash
cp .env.local.example .env.local
```

Notes:

- Keep secrets only in `.env.local`; do not commit real credentials.
- Use `.env.local.example` as the source of truth for required variables.
- The workspace ID is used by the "new idea" / launch flow when no workspace ID is passed explicitly.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Core Flows

### View sessions

The home page calls the Omnara session-list API and renders recent sessions for quick access.

### Open an existing session

`/session/[sessionId]`

This route fetches session detail and redirects to the most relevant agent session, preferring:

1. A currently working agent session
2. A connected agent session
3. The first available agent session

### Launch a new session

`POST /api/launch`

This route:

1. Creates a new Omnara user session from a prompt
2. Launches an agent session if one is not created automatically
3. Returns the user session ID and agent session ID

### Fork an existing session

`POST /api/fork`

This route:

1. Fetches the full agent message history
2. Truncates it at the selected fork point
3. Maps messages into Omnara's import format
4. Imports that truncated conversation as a new session
5. Launches a new agent run with the correction prompt

Important constraint:

- The fork restores conversation context, not an exact historical file-state snapshot.
- The launch prompt explicitly tells the agent to re-apply needed changes in a freshly cloned workspace.

### Watch a running session

The session detail view polls session status every 5 seconds. When a run is still working, the UI switches to a live branch view and appends new messages incrementally.

## Project Structure

```text
app/
  api/
    fork/                  Fork and relaunch a session
    launch/                Start a new session from a prompt
    sessions/              Session listing and message retrieval
  session/                 Session detail pages
components/                Reusable UI components
hooks/                     Client hooks for polling and message loading
lib/                       Omnara API client and message mapping logic
```

## Notes

- Omnara API access is handled in `lib/omnara.ts`.
- Message transformation for imports lives in `lib/messageMapper.ts`.
- Decision-point highlighting is handled by `lib/decisionDetector.ts`.
- Some UI components support richer flows such as idea launching and HTML previewing from generated files.
- This project is optimized around Omnara session inspection and branching, not full workspace checkpoint restoration.
