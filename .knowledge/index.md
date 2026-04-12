# System Knowledge Base

Last updated: 2026-04-12T20:19:41.543Z
Total entries: 3
Modules: 3

## Modules

### api/sessions
- Implemented GET /api/sessions route proxying to Omnara session detail (2026-04-12) — `7896eb7d-5225-457a-8627-4df91b437422`

### lib/messageMapper
- Transforms GET messages format to import-claude-session format (2026-04-12) — `77b03485-a678-45d7-98b1-33f19015c3d1`

### lib/omnara
- Server-side Omnara API client with typed fetch wrapper (2026-04-12) — `67f1d3aa-8f6b-406b-bab1-574da805ee74`

## Assumptions (all)

- lib/messageMapper: payload.content shape from GET messages matches ImportMessageContent shape expected by import endpoint
- lib/messageMapper: system messages should be dropped rather than mapped
- lib/omnara: Omnara API response shapes match docs as of 2026-04-12
- lib/omnara: payload.content from GET messages has compatible shape with import content field
