"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { AgentMessage } from "@/lib/omnara";

interface UseMessagesOptions {
  poll?: boolean;
  pollInterval?: number;
}

interface UseMessagesResult {
  messages: AgentMessage[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
}

export function useMessages(
  sessionId: string,
  agentSessionId: string,
  options: UseMessagesOptions = {}
): UseMessagesResult {
  const { poll = false, pollInterval = 5000 } = options;

  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [beforeId, setBeforeId] = useState<string | null>(null);
  const afterIdRef = useRef<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(
    async (opts: { before_id?: string; after_id?: string; initial?: boolean } = {}) => {
      try {
        const params = new URLSearchParams({ limit: "50" });
        if (opts.before_id) params.set("before_id", opts.before_id);
        if (opts.after_id) params.set("after_id", opts.after_id);

        const res = await fetch(
          `/api/sessions/${encodeURIComponent(sessionId)}/${encodeURIComponent(agentSessionId)}/messages?${params}`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const data = await res.json();
        const incoming: AgentMessage[] = data.messages ?? [];

        if (opts.after_id) {
          // Polling: append new messages at the end
          if (incoming.length > 0) {
            setMessages((prev) => [...prev, ...incoming]);
            afterIdRef.current = incoming[incoming.length - 1].message_id;
          }
        } else if (opts.before_id) {
          // Load more: prepend older messages
          setMessages((prev) => [...incoming, ...prev]);
          setHasMore(data.has_more ?? false);
          if (incoming.length > 0) {
            setBeforeId(incoming[0].message_id);
          }
        } else {
          // Initial load
          setMessages(incoming);
          setHasMore(data.has_more ?? false);
          if (incoming.length > 0) {
            setBeforeId(incoming[0].message_id);
            afterIdRef.current = incoming[incoming.length - 1].message_id;
          }
        }
      } catch (err) {
        if (opts.initial) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (opts.initial) setLoading(false);
      }
    },
    [sessionId, agentSessionId]
  );

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    setError(null);
    setMessages([]);
    setHasMore(false);
    afterIdRef.current = null;
    fetchMessages({ initial: true });
  }, [fetchMessages]);

  // Polling
  useEffect(() => {
    if (!poll) return;
    pollingRef.current = setInterval(() => {
      if (afterIdRef.current) {
        fetchMessages({ after_id: afterIdRef.current });
      }
    }, pollInterval);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [poll, pollInterval, fetchMessages]);

  const loadMore = useCallback(() => {
    if (beforeId) fetchMessages({ before_id: beforeId });
  }, [beforeId, fetchMessages]);

  return { messages, loading, error, hasMore, loadMore };
}
