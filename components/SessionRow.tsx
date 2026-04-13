"use client";

import Link from "next/link";
import type { UserSession } from "@/lib/omnara";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusMeta: Record<
  string,
  { color: string; bg: string; border: string; dot?: string }
> = {
  ACTIVE:    { color: "#46a758", bg: "rgba(70,167,88,0.1)",   border: "rgba(70,167,88,0.25)",   dot: "#46a758" },
  COMPLETED: { color: "#8b949e", bg: "rgba(139,148,158,0.08)",border: "rgba(139,148,158,0.2)" },
  DELETED:   { color: "#ff7b72", bg: "rgba(255,123,114,0.08)",border: "rgba(255,123,114,0.2)" },
};

export function SessionRow({ session, isFork }: { session: UserSession; isFork?: boolean }) {
  const m = statusMeta[session.status] ?? statusMeta.COMPLETED;

  // For fork rows, show a cleaner name instead of "fork:uuid:uuid:index"
  const displayName = isFork && session.name?.startsWith("fork:")
    ? `Fork at message #${session.name.split(":")[3] ?? "?"}`
    : (session.name ?? "Unnamed Session");

  return (
    <Link
      href={`/session/${session.session_id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "14px 20px",
          background: "#161b22",
          border: "1px solid #21262d",
          borderRadius: "12px",
          cursor: "pointer",
          transition: "border-color 0.15s, background 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#30363d";
          (e.currentTarget as HTMLDivElement).style.background = "#1c2128";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#21262d";
          (e.currentTarget as HTMLDivElement).style.background = "#161b22";
        }}
      >
        {/* Status dot */}
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: m.dot ?? m.color,
            flexShrink: 0,
          }}
        />

        {/* Name + ID */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "#f0f6fc",
              letterSpacing: "-0.3px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {isFork && (
              <span style={{ color: "#d2a8ff", marginRight: "6px", fontSize: "12px" }}>↪</span>
            )}
            {displayName}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#484f58",
              fontFamily: "monospace",
              marginTop: "2px",
            }}
          >
            {session.session_id}
          </div>
        </div>

        {/* Date */}
        <div
          style={{
            fontSize: "12px",
            color: "#8b949e",
            flexShrink: 0,
            letterSpacing: "-0.2px",
          }}
        >
          {fmtDate(session.created_at)}
        </div>

        {/* Status badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: m.bg,
            color: m.color,
            border: `1px solid ${m.border}`,
            borderRadius: "500px",
            padding: "2px 9px",
            fontSize: "11px",
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          {session.status}
        </span>

        {/* Arrow */}
        <span style={{ color: "#484f58", fontSize: "14px", flexShrink: 0 }}>
          →
        </span>
      </div>
    </Link>
  );
}
