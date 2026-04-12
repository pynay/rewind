"use client";

import { useState } from "react";
import type { AgentMessage } from "@/lib/omnara";

interface TimelineNodeProps {
  message: AgentMessage;
  index: number;
  canFork: boolean;
  onFork: (index: number, message: AgentMessage) => void;
  isLast: boolean;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

type SenderKind = "user" | "agent_session" | "system";

const senderMeta: Record<
  SenderKind,
  { label: string; color: string; dot: string }
> = {
  user:          { label: "User",   color: "#79c0ff", dot: "#79c0ff" },
  agent_session: { label: "Agent",  color: "#8b949e", dot: "#484f58" },
  system:        { label: "System", color: "#484f58", dot: "#30363d" },
};

const toolMeta = { label: "Tool", color: "#ffa657", dot: "#ffa657" };

export function TimelineNode({
  message,
  index,
  canFork,
  onFork,
  isLast,
}: TimelineNodeProps) {
  const [hovered, setHovered] = useState(false);

  const content = message.payload.content as Record<string, unknown>;
  const contentType = (content.type as string) ?? "text";
  const text = content.text as string | undefined;
  const toolName = content.name as string | undefined;

  const kind = message.sender.kind as SenderKind;
  const isTool = contentType === "tool_call" || contentType === "tool_result";
  const isSystem = kind === "system";

  const meta = isTool ? toolMeta : (senderMeta[kind] ?? senderMeta.system);

  return (
    <div
      style={{ display: "flex", gap: "0", opacity: isSystem ? 0.45 : 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Spine ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "32px",
          flexShrink: 0,
          paddingTop: "14px",
        }}
      >
        {/* Dot */}
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: hovered && canFork ? "#bdee63" : meta.dot,
            flexShrink: 0,
            transition: "background 0.15s",
            zIndex: 1,
          }}
        />
        {/* Line */}
        {!isLast && (
          <div
            style={{
              width: "1px",
              flex: 1,
              background: "#21262d",
              marginTop: "4px",
              minHeight: "20px",
            }}
          />
        )}
      </div>

      {/* ── Body ──────────────────────────────────── */}
      <div style={{ flex: 1, paddingBottom: "20px", paddingTop: "10px", minWidth: 0 }}>
        {/* Header line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
          }}
        >
          {/* Sender / type label */}
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: meta.color,
              letterSpacing: "0.2px",
              textTransform: "uppercase",
            }}
          >
            {isTool ? contentType.replace("_", " ") : meta.label}
          </span>

          {/* Tool name pill */}
          {isTool && toolName && (
            <span
              style={{
                fontSize: "11px",
                color: "#8b949e",
                background: "#1c2128",
                border: "1px solid #21262d",
                borderRadius: "3px",
                padding: "1px 6px",
                fontFamily: "monospace",
                letterSpacing: 0,
              }}
            >
              {toolName}
            </span>
          )}

          <span style={{ fontSize: "11px", color: "#484f58", fontVariantNumeric: "tabular-nums" }}>
            {fmtTime(message.created_at)}
          </span>
          <span style={{ fontSize: "11px", color: "#30363d" }}>
            #{index + 1}
          </span>
        </div>

        {/* Content */}
        {text ? (
          <p
            style={{
              fontSize: "13px",
              color: isSystem ? "#484f58" : "#c9d1d9",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
              letterSpacing: "-0.1px",
            }}
          >
            {text}
          </p>
        ) : isTool ? (
          <p style={{ fontSize: "12px", color: "#484f58", fontStyle: "italic", margin: 0 }}>
            {contentType === "tool_call" ? "Invoking tool…" : "Result received"}
          </p>
        ) : null}

        {/* Fork button */}
        {canFork && hovered && !isSystem && (
          <button
            onClick={() => onFork(index, message)}
            style={{
              marginTop: "8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "11px",
              fontWeight: 500,
              color: "#bdee63",
              background: "rgba(189,238,99,0.06)",
              border: "1px solid rgba(189,238,99,0.2)",
              borderRadius: "3px",
              padding: "4px 10px",
              cursor: "pointer",
              letterSpacing: "-0.1px",
              transition: "background 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(189,238,99,0.12)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(189,238,99,0.06)")
            }
          >
            ↪ Fork from here
          </button>
        )}
      </div>
    </div>
  );
}
