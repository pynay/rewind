"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AgentMessage } from "@/lib/omnara";

interface ForkModalProps {
  sessionId: string;
  agentSessionId: string;
  workspaceId: string;
  forkAfterIndex: number;
  forkAfterMessage: AgentMessage;
  onClose: () => void;
}

export function ForkModal({
  sessionId,
  agentSessionId,
  workspaceId,
  forkAfterIndex,
  forkAfterMessage,
  onClose,
}: ForkModalProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const content = forkAfterMessage.payload.content as Record<string, unknown>;
  const preview =
    (content.text as string | undefined)?.slice(0, 140) ??
    (content.type as string | undefined) ??
    "—";

  async function handleFork() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/fork", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: workspaceId,
          session_id: sessionId,
          agent_session_id: agentSessionId,
          fork_after_index: forkAfterIndex,
          correction_prompt: prompt.trim(),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      router.push(
        `/session/${encodeURIComponent(body.fork_session_id)}/${encodeURIComponent(body.fork_agent_session_id)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  }

  return (
    /* Backdrop */
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(1,4,9,0.75)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        padding: "24px",
      }}
    >
      {/* Card */}
      <div
        className="animate-slide-in"
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 18px",
            borderBottom: "1px solid #21262d",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 600,
                letterSpacing: "-0.5px",
                color: "#f0f6fc",
                margin: "0 0 4px 0",
              }}
            >
              Fork session
            </h3>
            <p style={{ fontSize: "12px", color: "#8b949e", margin: 0, letterSpacing: "-0.2px" }}>
              Replays history through message {forkAfterIndex + 1}, then runs your correction.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#8b949e",
              cursor: "pointer",
              padding: "2px",
              fontSize: "18px",
              lineHeight: 1,
              marginLeft: "12px",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Fork point */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #21262d",
            background: "#0d1117",
          }}
        >
          <div style={{ fontSize: "10px", color: "#484f58", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px", fontWeight: 500 }}>
            Forking after
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "#8b949e",
              lineHeight: 1.5,
              margin: 0,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {preview}
          </p>
        </div>

        {/* Prompt input */}
        <div style={{ padding: "18px 24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 500,
              color: "#8b949e",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
            }}
          >
            Correction prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what the agent should do differently…"
            rows={4}
            autoFocus
            style={{
              width: "100%",
              background: "#0d1117",
              border: "1px solid #21262d",
              borderRadius: "3px",
              padding: "10px 14px",
              fontSize: "13px",
              color: "#f0f6fc",
              fontFamily: "inherit",
              outline: "none",
              resize: "vertical",
              lineHeight: 1.55,
              letterSpacing: "-0.1px",
              transition: "border-color 0.15s, box-shadow 0.15s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#bdee63";
              e.target.style.boxShadow = "0 0 0 3px rgba(189,238,99,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#21262d";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              margin: "0 24px",
              padding: "10px 14px",
              background: "rgba(255,123,114,0.08)",
              border: "1px solid rgba(255,123,114,0.2)",
              borderRadius: "3px",
              fontSize: "13px",
              color: "#ff7b72",
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            padding: "16px 24px 20px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          <button className="btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleFork}
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin-slow"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Forking…
              </>
            ) : (
              "Fork & run →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
