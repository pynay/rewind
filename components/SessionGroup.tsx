"use client";

import { useState } from "react";
import type { UserSession } from "@/lib/omnara";
import { SessionRow } from "./SessionRow";

interface SessionGroupProps {
  session: UserSession;
  forks: UserSession[];
}

export function SessionGroup({ session, forks }: SessionGroupProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      {/* Original session row */}
      <SessionRow session={session} />

      {/* Fork toggle bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 20px 6px 44px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: "11px",
          fontWeight: 500,
          color: "#d2a8ff",
          letterSpacing: "-0.1px",
          transition: "color 0.15s",
        }}
      >
        <span style={{ fontSize: "10px" }}>{expanded ? "▾" : "▸"}</span>
        {forks.length} fork{forks.length !== 1 ? "s" : ""}
      </button>

      {/* Indented fork rows */}
      {expanded && (
        <div
          style={{
            marginLeft: "24px",
            paddingLeft: "16px",
            borderLeft: "2px solid rgba(210,168,255,0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            marginBottom: "4px",
          }}
        >
          {forks.map((fork) => (
            <SessionRow key={fork.session_id} session={fork} isFork />
          ))}
        </div>
      )}
    </div>
  );
}
