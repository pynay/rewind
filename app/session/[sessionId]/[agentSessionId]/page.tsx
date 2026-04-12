import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionDetail } from "@/lib/omnara";
import { SessionCard } from "@/components/SessionCard";
import { Timeline } from "@/components/Timeline";
import { BranchView } from "@/components/BranchView";

interface Props {
  params: Promise<{ sessionId: string; agentSessionId: string }>;
}

export default async function SessionPage({ params }: Props) {
  const { sessionId, agentSessionId } = await params;

  let detail;
  try {
    detail = await getSessionDetail(sessionId);
  } catch {
    notFound();
  }

  const agentSession = detail.agent_sessions.find(
    (a) => a.session_id === agentSessionId
  );
  if (!agentSession) notFound();

  const isWorking = agentSession.work_status === "WORKING";
  const workspaceId = detail.workspace?.id;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Sticky nav ────────────────────────────────── */}
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
          gap: "16px",
        }}
      >
        {/* Back */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#8b949e",
            textDecoration: "none",
            letterSpacing: "-0.2px",
            flexShrink: 0,
            transition: "color 0.15s",
          }}
          onMouseEnter={undefined}
        >
          ← Back
        </Link>

        <span style={{ color: "#21262d", fontSize: "16px", flexShrink: 0 }}>
          /
        </span>

        {/* Session name */}
        <span
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#f0f6fc",
            letterSpacing: "-0.4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {detail.session.name ?? "Unnamed Session"}
        </span>

        {/* Status */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            flexShrink: 0,
            alignItems: "center",
          }}
        >
          {isWorking && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(189,238,99,0.08)",
                color: "#bdee63",
                border: "1px solid rgba(189,238,99,0.2)",
                borderRadius: "500px",
                padding: "2px 9px",
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              <span
                className="animate-pulse-dot"
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "#bdee63",
                }}
              />
              WORKING
            </span>
          )}
          {!isWorking && (
            <span
              style={{
                background: "rgba(139,148,158,0.08)",
                color: "#8b949e",
                border: "1px solid rgba(139,148,158,0.2)",
                borderRadius: "500px",
                padding: "2px 9px",
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              {agentSession.work_status}
            </span>
          )}
        </div>
      </header>

      {/* ── Content ───────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          maxWidth: "760px",
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px 64px",
        }}
      >
        <SessionCard session={detail.session} agentSession={agentSession} />

        {isWorking ? (
          <BranchView
            sessionId={sessionId}
            agentSessionId={agentSessionId}
            workspaceId={workspaceId}
          />
        ) : (
          <Timeline
            sessionId={sessionId}
            agentSessionId={agentSessionId}
            workspaceId={workspaceId}
            poll={false}
          />
        )}
      </main>
    </div>
  );
}
