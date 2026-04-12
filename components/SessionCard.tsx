import type { UserSession, AgentSession } from "@/lib/omnara";
import { StatusBadge } from "./StatusBadge";

interface SessionCardProps {
  session: UserSession;
  agentSession: AgentSession;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SessionCard({ session, agentSession }: SessionCardProps) {
  return (
    <div
      style={{
        background: "#161b22",
        border: "1px solid #21262d",
        borderRadius: "12px",
        padding: "20px 24px",
        marginBottom: "24px",
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "14px",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "-0.5px",
              color: "#f0f6fc",
              margin: "0 0 4px 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {session.name ?? "Unnamed Session"}
          </h2>
          <span
            style={{
              fontSize: "11px",
              color: "#484f58",
              fontFamily: "monospace",
            }}
          >
            {session.session_id}
          </span>
        </div>
        <div style={{ display: "flex", gap: "6px", flexShrink: 0, paddingTop: "2px" }}>
          <StatusBadge status={session.status} />
          <StatusBadge status={agentSession.work_status} />
        </div>
      </div>

      {/* Meta row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0 24px",
          borderTop: "1px solid #21262d",
          paddingTop: "12px",
        }}
      >
        {[
          ["Started", fmt(session.created_at)],
          ["Type", agentSession.session_type],
          ["Connection", agentSession.connection_status],
          ...(agentSession.daemon_version
            ? [["Agent", agentSession.daemon_version]]
            : []),
        ].map(([label, value]) => (
          <span key={label} style={{ fontSize: "12px", color: "#484f58" }}>
            {label}{" "}
            <span style={{ color: "#8b949e" }}>{value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
