"use client";

import { useState, useEffect, useRef } from "react";
import type { AgentSession } from "@/lib/omnara";
import { Timeline } from "./Timeline";
import { BranchView } from "./BranchView";
import { SessionCard } from "./SessionCard";
import type { UserSession } from "@/lib/omnara";

interface SessionContentProps {
  sessionId: string;
  agentSessionId: string;
  workspaceId: string | undefined;
  initialSession: UserSession;
  initialAgentSession: AgentSession;
}

export function SessionContent({
  sessionId,
  agentSessionId,
  workspaceId,
  initialSession,
  initialAgentSession,
}: SessionContentProps) {
  const [workStatus, setWorkStatus] = useState(initialAgentSession.work_status);
  const [session, setSession] = useState(initialSession);
  const [agentSession, setAgentSession] = useState(initialAgentSession);
  const stoppedRef = useRef(false);

  const isWorking = workStatus === "WORKING";

  useEffect(() => {
    stoppedRef.current = false;

    async function pollStatus() {
      if (stoppedRef.current) return;

      try {
        const res = await fetch(
          `/api/sessions?sessionId=${encodeURIComponent(sessionId)}`
        );
        if (!res.ok) return;

        const detail = await res.json();
        const agent = (detail.agent_sessions ?? []).find(
          (a: { session_id: string }) => a.session_id === agentSessionId
        );

        if (agent) {
          setWorkStatus(agent.work_status);
          setAgentSession(agent);
        }
        if (detail.session) {
          setSession(detail.session);
        }
      } catch {
        // Silently ignore poll errors
      }

      if (!stoppedRef.current) {
        setTimeout(pollStatus, 5000);
      }
    }

    // Start polling after initial delay
    const timer = setTimeout(pollStatus, 5000);
    return () => {
      stoppedRef.current = true;
      clearTimeout(timer);
    };
  }, [sessionId, agentSessionId]);

  return (
    <>
      {/* Status badge in a bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "0 0 8px",
        }}
      >
        {isWorking ? (
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
        ) : (
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
            {workStatus}
          </span>
        )}
      </div>

      <SessionCard session={session} agentSession={agentSession} />

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
    </>
  );
}
