"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ManualEntryForm() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const [agentSessionId, setAgentSessionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!sessionId.trim() || !agentSessionId.trim()) {
      setError("Both IDs are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/sessions?sessionId=${encodeURIComponent(sessionId.trim())}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      router.push(
        `/session/${encodeURIComponent(sessionId.trim())}/${encodeURIComponent(agentSessionId.trim())}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 500,
              color: "#8b949e",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
            }}
          >
            User Session ID
          </label>
          <input
            className="input-field"
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 500,
              color: "#8b949e",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
            }}
          >
            Agent Session ID
          </label>
          <input
            className="input-field"
            type="text"
            value={agentSessionId}
            onChange={(e) => setAgentSessionId(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        {error && (
          <div
            style={{
              background: "rgba(255,123,114,0.08)",
              border: "1px solid rgba(255,123,114,0.25)",
              borderRadius: "3px",
              padding: "10px 14px",
              fontSize: "13px",
              color: "#ff7b72",
              letterSpacing: "-0.2px",
            }}
          >
            {error}
          </div>
        )}

        <button
          className="btn-primary"
          type="submit"
          disabled={loading}
          style={{ marginTop: "4px" }}
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
              Opening…
            </>
          ) : (
            "Open session →"
          )}
        </button>
      </div>
    </form>
  );
}
