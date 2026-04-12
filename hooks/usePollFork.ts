"use client";

import { useState, useEffect, useRef } from "react";
import type { AgentMessage } from "@/lib/omnara";

interface UsePollForkResult {
  messages: AgentMessage[];
  workStatus: "IDLE" | "WORKING" | "COMPLETED" | null;
  error: string | null;
}

export function usePollFork(
  sessionId: string,
  agentSessionId: string,
  interval = 5000
): UsePollForkResult {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [workStatus, setWorkStatus] = useState<"IDLE" | "WORKING" | "COMPLETED" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const afterIdRef = useRef<string | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    stoppedRef.current = false;

    async function poll() {
      if (stoppedRef.current) return;

      try {
        // Check work status via session detail
        const detailRes = await fetch(`/api/sessions?sessionId=${encodeURIComponent(sessionId)}`);
        if (detailRes.ok) {
          const detail = await detailRes.json();
          const agent = (detail.agent_sessions ?? []).find(
            (a: { session_id: string; work_status: string }) => a.session_id === agentSessionId
          );
          if (agent) {
            setWorkStatus(agent.work_status);
            if (agent.work_status === "COMPLETED") {
              stoppedRef.current = true;
            }
          }
        }

        // Fetch new messages
        const params = new URLSearchParams({ limit: "50" });
        if (afterIdRef.current) params.set("after_id", afterIdRef.current);

        const res = await fetch(
          `/api/sessions/${encodeURIComponent(sessionId)}/${encodeURIComponent(agentSessionId)}/messages?${params}`
        );
        if (!res.ok) return;

        const data = await res.json();
        const incoming: AgentMessage[] = data.messages ?? [];
        if (incoming.length > 0) {
          setMessages((prev) => {
            const seen = new Set(prev.map((m) => m.message_id));
            const fresh = incoming.filter((m) => !seen.has(m.message_id));
            return fresh.length > 0 ? [...prev, ...fresh] : prev;
          });
          afterIdRef.current = incoming[incoming.length - 1].message_id;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }

      if (!stoppedRef.current) {
        setTimeout(poll, interval);
      }
    }

    poll();

    return () => {
      stoppedRef.current = true;
    };
  }, [sessionId, agentSessionId, interval]);

  return { messages, workStatus, error };
}
