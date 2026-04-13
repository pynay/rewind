"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function IdeaLauncher() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLaunch() {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);

      router.push(
        `/session/${encodeURIComponent(body.session_id)}/${encodeURIComponent(body.agent_session_id)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "#161b22",
        border: "1px solid #21262d",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid #21262d",
        }}
      >
        <h3
          style={{
            fontSize: "15px",
            fontWeight: 600,
            letterSpacing: "-0.5px",
            color: "#f0f6fc",
            margin: "0 0 4px 0",
          }}
        >
          New idea
        </h3>
        <p
          style={{
            fontSize: "12px",
            color: "#8b949e",
            margin: 0,
            letterSpacing: "-0.2px",
          }}
        >
          Describe what you want to build. An agent will start working on it immediately.
        </p>
      </div>

      {/* Input */}
      <div style={{ padding: "16px 24px" }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Build me a kanban board with drag and drop..."
          rows={3}
          style={{
            width: "100%",
            background: "#0d1117",
            border: "1px solid #21262d",
            borderRadius: "6px",
            padding: "12px 14px",
            fontSize: "14px",
            color: "#f0f6fc",
            fontFamily: "inherit",
            outline: "none",
            resize: "vertical",
            lineHeight: 1.55,
            letterSpacing: "-0.2px",
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleLaunch();
            }
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            margin: "0 24px 16px",
            padding: "10px 14px",
            background: "rgba(255,123,114,0.08)",
            border: "1px solid rgba(255,123,114,0.2)",
            borderRadius: "6px",
            fontSize: "13px",
            color: "#ff7b72",
          }}
        >
          {error}
        </div>
      )}

      {/* Action */}
      <div
        style={{
          padding: "0 24px 20px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={handleLaunch}
          disabled={loading || !prompt.trim()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 500,
            color: loading || !prompt.trim() ? "#484f58" : "#0d1117",
            background: loading || !prompt.trim() ? "#21262d" : "#bdee63",
            border: "none",
            borderRadius: "6px",
            padding: "10px 20px",
            cursor: loading || !prompt.trim() ? "default" : "pointer",
            fontFamily: "inherit",
            letterSpacing: "-0.2px",
            transition: "background 0.15s, color 0.15s",
          }}
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
              Launching...
            </>
          ) : (
            "Launch →"
          )}
        </button>
      </div>
    </div>
  );
}
