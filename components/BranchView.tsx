"use client";

import { usePollFork } from "@/hooks/usePollFork";
import { TimelineNode } from "./TimelineNode";
import { PreviewPanel } from "./PreviewPanel";

interface BranchViewProps {
  sessionId: string;
  agentSessionId: string;
  workspaceId?: string;
}

export function BranchView({ sessionId, agentSessionId, workspaceId }: BranchViewProps) {
  const { messages, workStatus, error } = usePollFork(sessionId, agentSessionId);
  const isWorking = workStatus === "WORKING" || workStatus === null;
  const isCompleted = workStatus === "COMPLETED";

  return (
    <div>
      {/* Status banner */}
      {isWorking ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 18px",
            background: "rgba(189,238,99,0.05)",
            border: "1px solid rgba(189,238,99,0.15)",
            borderRadius: "12px",
            marginBottom: "24px",
            fontSize: "13px",
            color: "#bdee63",
            letterSpacing: "-0.2px",
          }}
        >
          <span
            className="animate-pulse-dot"
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#bdee63",
              flexShrink: 0,
            }}
          />
          Branch is running…
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "#8b949e" }}>
            Polling every 5s
          </span>
        </div>
      ) : isCompleted ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 18px",
            background: "rgba(70,167,88,0.06)",
            border: "1px solid rgba(70,167,88,0.2)",
            borderRadius: "12px",
            marginBottom: "24px",
            fontSize: "13px",
            color: "#46a758",
            letterSpacing: "-0.2px",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#46a758",
              flexShrink: 0,
            }}
          />
          Branch completed
        </div>
      ) : null}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "12px 18px",
            background: "rgba(255,123,114,0.08)",
            border: "1px solid rgba(255,123,114,0.2)",
            borderRadius: "12px",
            marginBottom: "24px",
            fontSize: "13px",
            color: "#ff7b72",
          }}
        >
          {error}
        </div>
      )}

      {/* Empty state while starting */}
      {messages.length === 0 && isWorking && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "48px 0",
            color: "#484f58",
            fontSize: "13px",
          }}
        >
          <svg
            className="animate-spin-slow"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Waiting for first message…
        </div>
      )}

      {/* Preview */}
      <PreviewPanel messages={messages} />

      {/* Messages */}
      <div>
        {messages.map((msg, idx) => (
          <TimelineNode
            key={msg.message_id}
            message={msg}
            index={idx}
            canFork={!isWorking && !!workspaceId}
            onFork={() => {}}
            isLast={idx === messages.length - 1}
          />
        ))}
      </div>

      {/* Live indicator at bottom */}
      {isWorking && messages.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            paddingLeft: "32px",
            paddingTop: "4px",
            fontSize: "11px",
            color: "#bdee63",
          }}
        >
          <span
            className="animate-pulse-dot"
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#bdee63",
              display: "inline-block",
            }}
          />
          Live
        </div>
      )}
    </div>
  );
}
