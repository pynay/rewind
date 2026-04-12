import { listUserSessions } from "@/lib/omnara";
import type { UserSession } from "@/lib/omnara";
import { ManualEntryForm } from "@/components/ManualEntryForm";
import { SessionRow } from "@/components/SessionRow";

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function Home() {
  // Try to fetch recent sessions; silently degrade if the API call fails
  let sessions: UserSession[] = [];
  let listError: string | null = null;

  try {
    const data = await listUserSessions({ limit: 20 });
    sessions = data.sessions ?? [];
  } catch (err) {
    listError =
      err instanceof Error ? err.message : "Could not load sessions.";
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Nav ─────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: "1px solid #21262d",
          background: "rgba(13,17,23,0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "15px",
            fontWeight: 600,
            letterSpacing: "-0.8px",
            color: "#f0f6fc",
          }}
        >
          rewind
        </span>
        <span style={{ fontSize: "12px", color: "#484f58", letterSpacing: "-0.2px" }}>
          Omnara session viewer
        </span>
      </header>

      {/* ── Content ─────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          maxWidth: "680px",
          width: "100%",
          margin: "0 auto",
          padding: "48px 24px 80px",
        }}
      >
        {/* Heading */}
        <div style={{ marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.4rem)",
              fontWeight: 500,
              letterSpacing: "-3px",
              lineHeight: 1,
              color: "#f0f6fc",
              margin: "0 0 12px 0",
            }}
          >
            rewind.
          </h1>
          <p
            style={{
              color: "#8b949e",
              fontSize: "15px",
              letterSpacing: "-0.3px",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Review and fork your Omnara agent session history.
          </p>
        </div>

        {/* ── Recent sessions ───────────────────────────── */}
        {listError ? (
          <div
            style={{
              padding: "14px 18px",
              background: "rgba(255,123,114,0.06)",
              border: "1px solid rgba(255,123,114,0.15)",
              borderRadius: "12px",
              fontSize: "13px",
              color: "#ff7b72",
              marginBottom: "40px",
              letterSpacing: "-0.2px",
            }}
          >
            Could not load sessions: {listError}
          </div>
        ) : sessions.length > 0 ? (
          <section style={{ marginBottom: "48px" }}>
            <h2
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "#484f58",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                margin: "0 0 12px 0",
              }}
            >
              Recent sessions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {sessions.map((s) => (
                <SessionRow key={s.session_id} session={s} />
              ))}
            </div>
          </section>
        ) : (
          <div
            style={{
              padding: "32px",
              border: "1px dashed #21262d",
              borderRadius: "12px",
              textAlign: "center",
              fontSize: "13px",
              color: "#484f58",
              marginBottom: "48px",
            }}
          >
            No sessions found. Sessions appear here once your agent runs.
          </div>
        )}

        {/* ── Manual entry ──────────────────────────────── */}
        <section>
          <h2
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "#484f58",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              margin: "0 0 12px 0",
            }}
          >
            Open by ID
          </h2>
          <ManualEntryForm />
        </section>
      </main>
    </div>
  );
}
