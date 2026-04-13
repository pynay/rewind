/**
 * Detects whether an agent message contains a decision point — a moment
 * where the agent chose an approach, library, framework, or pattern.
 *
 * These are the messages users most likely want to fork from, so the
 * timeline highlights them as suggested fork points.
 *
 * Detection is pure regex — no LLM calls, no API changes. Patterns are
 * compiled once at module scope for performance.
 */

import type { AgentMessage } from "./omnara";

const DECISION_PATTERNS: RegExp[] = [
  // "I'll use React", "Let me create a component", "I'm going to build..."
  /\b(?:I'll|I will|Let me|Let's|I'm going to|Going to|We'll|We will)\s+(?:use|create|build|set up|implement|write|make|start with|go with|choose|pick|opt for|switch to|install|add|configure|initialize|scaffold|bootstrap)/i,

  // "Plan: ...", "Approach: ...", "Strategy: ..."
  /\b(?:Plan|Approach|Strategy|Decision|Architecture):\s/i,

  // "using React for the frontend", "with Tailwind as the..."
  /\b(?:using|with)\s+[A-Z][\w.-]+\s+(?:for|to|as|instead)/i,

  // "instead of using Passport", "instead of SQLite"
  /\binstead of\s+(?:using\s+)?[A-Z][\w.-]+/i,

  // "I'll go with", "I'll stick with"
  /\bI(?:'ll| will) (?:go|stick) with\b/i,

  // "Here's my plan", "Here's what I'll do"
  /\b(?:Here's my plan|Here's what I'll|Here is what I'll|Here's the plan)\b/i,
];

export function isDecisionPoint(message: AgentMessage): boolean {
  if (message.sender.kind !== "agent_session") return false;

  const content = message.payload.content as Record<string, unknown>;
  if (content.type !== "text") return false;

  const text = content.text as string | undefined;
  if (!text) return false;

  for (const pattern of DECISION_PATTERNS) {
    if (pattern.test(text)) return true;
  }

  return false;
}
