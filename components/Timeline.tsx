"use client";

import { useState } from "react";
import { useMessages } from "@/hooks/useMessages";
import { TimelineNode } from "./TimelineNode";
import { ForkModal } from "./ForkModal";
import type { AgentMessage } from "@/lib/omnara";

interface TimelineProps {
  sessionId: string;
  agentSessionId: string;
  workspaceId: string | undefined;
  poll?: boolean;
}

interface ForkTarget {
  index: number;
  message: AgentMessage;
}

export function Timeline({
  sessionId,
  agentSessionId,
  workspaceId,
  poll = false,
}: TimelineProps) {
  const { messages, loading, error, hasMore, loadMore } = useMessages(
    sessionId,
    agentSessionId,
    { poll }
  );

  const [forkTarget, setForkTarget] = useState<ForkTarget | null>(null);

  if (loading) {
    return (
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
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        Loading messages…
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: "rgba(255,123,114,0.08)",
          border: "1px solid rgba(255,123,114,0.2)",
          borderRadius: "12px",
          padding: "16px 20px",
          fontSize: "13px",
          color: "#ff7b72",
        }}
      >
        {error}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div
        style={{
          padding: "64px 0",
          textAlign: "center",
          color: "#484f58",
          fontSize: "13px",
        }}
      >
        No messages in this session.
      </div>
    );
  }

  return (
    <>
      {hasMore && (
        <button
          onClick={loadMore}
          className="btn-ghost"
          style={{ width: "100%", justifyContent: "center", marginBottom: "8px" }}
        >
          Load earlier messages
        </button>
      )}

      <div>
        {messages.map((msg, idx) => (
          <TimelineNode
            key={msg.message_id}
            message={msg}
            index={idx}
            canFork={!!workspaceId}
            onFork={(i, m) => setForkTarget({ index: i, message: m })}
            isLast={idx === messages.length - 1}
          />
        ))}
      </div>

      {poll && (
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
          <span className="animate-pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#bdee63", display: "inline-block" }} />
          Live
        </div>
      )}

      {forkTarget && workspaceId && (
        <ForkModal
          sessionId={sessionId}
          agentSessionId={agentSessionId}
          workspaceId={workspaceId}
          forkAfterIndex={forkTarget.index}
          forkAfterMessage={forkTarget.message}
          onClose={() => setForkTarget(null)}
        />
      )}
    </>
  );
}
