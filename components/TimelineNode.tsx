"use client";

import { useState } from "react";
import type { AgentMessage } from "@/lib/omnara";

interface TimelineNodeProps {
  message: AgentMessage;
  index: number;
  canFork: boolean;
  isDecisionPoint?: boolean;
  onFork: (index: number, message: AgentMessage) => void;
  isLast: boolean;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
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
  isDecisionPoint: isDecision = false,
  onFork,
  isLast,
}: TimelineNodeProps) {
  const [hovered, setHovered] = useState(false);

  const content = message.payload.content as Record<string, unknown>;
  const contentType = (content.type as string) ?? "text";
  const text = content.text as string | undefined;
  const toolName = content.name as string | undefined;
  const toolArgs = content.arguments as Record<string, unknown> | undefined;
  const toolOutput = content.output as Record<string, unknown> | string | undefined;
  const isError = content.is_error as boolean | undefined;

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
        {/* Dot — diamond shape for decision points, circle for others */}
        <div
          style={{
            width: isDecision ? "10px" : "8px",
            height: isDecision ? "10px" : "8px",
            borderRadius: isDecision ? "2px" : "50%",
            transform: isDecision ? "rotate(45deg)" : "none",
            background: hovered && canFork ? "#bdee63" : isDecision ? "#d2a8ff" : meta.dot,
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
      <div style={{
        flex: 1,
        paddingBottom: "20px",
        paddingTop: "10px",
        minWidth: 0,
        borderLeft: isDecision ? "2px solid #d2a8ff" : "none",
        paddingLeft: isDecision ? "12px" : "0",
      }}>
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

          {/* Decision point pill */}
          {isDecision && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "10px",
                fontWeight: 600,
                color: "#d2a8ff",
                background: "rgba(210,168,255,0.08)",
                border: "1px solid rgba(210,168,255,0.2)",
                borderRadius: "3px",
                padding: "2px 8px",
                letterSpacing: "0.2px",
                textTransform: "uppercase",
              }}
            >
              ◆ Decision point
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
        ) : contentType === "tool_call" ? (
          <div style={{ fontSize: "12px", color: "#8b949e", margin: 0 }}>
            {toolArgs?.description ? (
              <p style={{ margin: 0, color: "#c9d1d9" }}>
                {toolArgs.description as string}
              </p>
            ) : null}
            {toolArgs?.command ? (
              <pre
                style={{
                  margin: toolArgs?.description ? "6px 0 0" : 0,
                  padding: "8px 10px",
                  background: "#161b22",
                  border: "1px solid #21262d",
                  borderRadius: "4px",
                  fontSize: "11px",
                  color: "#e6edf3",
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  maxHeight: "120px",
                  fontFamily: "monospace",
                }}
              >
                {toolArgs.command as string}
              </pre>
            ) : null}
          </div>
        ) : contentType === "tool_result" ? (
          <div style={{ fontSize: "12px", margin: 0 }}>
            <pre
              style={{
                margin: 0,
                padding: "8px 10px",
                background: isError ? "rgba(248,81,73,0.08)" : "#161b22",
                border: `1px solid ${isError ? "rgba(248,81,73,0.3)" : "#21262d"}`,
                borderRadius: "4px",
                fontSize: "11px",
                color: isError ? "#f85149" : "#8b949e",
                overflow: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                maxHeight: "160px",
                fontFamily: "monospace",
              }}
            >
              {typeof toolOutput === "string"
                ? toolOutput
                : (toolOutput as Record<string, unknown>)?.value
                  ? String((toolOutput as Record<string, unknown>).value).slice(0, 500)
                  : "No output"}
            </pre>
          </div>
        ) : isSystem ? (
          <p style={{ fontSize: "11px", color: "#484f58", fontStyle: "italic", margin: 0 }}>
            {contentType.replace(/_/g, " ")}
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
            {isDecision ? "↪ Fork from this decision" : "↪ Fork from here"}
          </button>
        )}
      </div>
    </div>
  );
}
