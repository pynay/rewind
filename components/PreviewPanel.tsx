"use client";

import { useState, useMemo } from "react";
import type { AgentMessage } from "@/lib/omnara";

interface PreviewPanelProps {
  messages: AgentMessage[];
}

interface HtmlFile {
  path: string;
  content: string;
  timestamp: string;
}

/**
 * Extract the latest HTML file content from Write tool calls.
 * Returns the most recently written .html file, or null.
 */
function extractHtmlFiles(messages: AgentMessage[]): HtmlFile[] {
  const files = new Map<string, HtmlFile>();

  for (const msg of messages) {
    const content = msg.payload.content as Record<string, unknown>;
    if (content.type !== "tool_call") continue;

    const name = content.name as string;
    const args = content.arguments as Record<string, unknown> | undefined;
    if (!args) continue;

    if (name === "Write" && typeof args.file_path === "string" && typeof args.content === "string") {
      const filePath = args.file_path as string;
      if (filePath.endsWith(".html")) {
        files.set(filePath, {
          path: filePath,
          content: args.content as string,
          timestamp: msg.created_at,
        });
      }
    }
  }

  return Array.from(files.values());
}

export function PreviewPanel({ messages }: PreviewPanelProps) {
  const htmlFiles = useMemo(() => extractHtmlFiles(messages), [messages]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  if (htmlFiles.length === 0) return null;

  const current = htmlFiles[Math.min(selectedIndex, htmlFiles.length - 1)];
  const shortPath = current.path.split("/").slice(-2).join("/");

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Toggle bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 18px",
          background: expanded ? "rgba(189,238,99,0.06)" : "#161b22",
          border: `1px solid ${expanded ? "rgba(189,238,99,0.2)" : "#21262d"}`,
          borderRadius: expanded ? "12px 12px 0 0" : "12px",
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.15s",
        }}
      >
        <span style={{ fontSize: "14px" }}>{expanded ? "▾" : "▸"}</span>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "#bdee63",
            letterSpacing: "-0.2px",
          }}
        >
          Preview
        </span>
        <span
          style={{
            fontSize: "11px",
            color: "#8b949e",
            fontFamily: "monospace",
          }}
        >
          {shortPath}
        </span>
        {htmlFiles.length > 1 && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "11px",
              color: "#484f58",
            }}
          >
            {htmlFiles.length} files
          </span>
        )}
      </button>

      {/* Preview area */}
      {expanded && (
        <div
          style={{
            border: "1px solid rgba(189,238,99,0.2)",
            borderTop: "none",
            borderRadius: "0 0 12px 12px",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          {/* File tabs if multiple */}
          {htmlFiles.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: "0",
                borderBottom: "1px solid #21262d",
                background: "#0d1117",
                overflowX: "auto",
              }}
            >
              {htmlFiles.map((f, i) => {
                const label = f.path.split("/").pop() ?? f.path;
                return (
                  <button
                    key={f.path}
                    onClick={() => setSelectedIndex(i)}
                    style={{
                      padding: "8px 16px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: i === selectedIndex ? "#bdee63" : "#8b949e",
                      background: i === selectedIndex ? "#161b22" : "transparent",
                      border: "none",
                      borderBottom: i === selectedIndex ? "2px solid #bdee63" : "2px solid transparent",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* iframe */}
          <iframe
            srcDoc={current.content}
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: "100%",
              height: "480px",
              border: "none",
              display: "block",
            }}
            title={`Preview: ${shortPath}`}
          />
        </div>
      )}
    </div>
  );
}
