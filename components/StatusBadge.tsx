type Status =
  | "ACTIVE"
  | "COMPLETED"
  | "DELETED"
  | "IDLE"
  | "WORKING"
  | "CONNECTED"
  | "DISCONNECTED";

interface StatusBadgeProps {
  status: Status;
}

const config: Record<
  Status,
  { bg: string; color: string; border: string; dot?: string }
> = {
  ACTIVE:       { bg: "rgba(70,167,88,0.1)",   color: "#46a758", border: "rgba(70,167,88,0.25)",   dot: "#46a758" },
  CONNECTED:    { bg: "rgba(70,167,88,0.1)",   color: "#46a758", border: "rgba(70,167,88,0.25)" },
  WORKING:      { bg: "rgba(189,238,99,0.08)", color: "#bdee63", border: "rgba(189,238,99,0.2)",   dot: "#bdee63" },
  COMPLETED:    { bg: "rgba(139,148,158,0.08)",color: "#8b949e", border: "rgba(139,148,158,0.2)" },
  IDLE:         { bg: "rgba(139,148,158,0.08)",color: "#8b949e", border: "rgba(139,148,158,0.2)" },
  DELETED:      { bg: "rgba(255,123,114,0.08)",color: "#ff7b72", border: "rgba(255,123,114,0.2)" },
  DISCONNECTED: { bg: "rgba(255,123,114,0.08)",color: "#ff7b72", border: "rgba(255,123,114,0.2)" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const c = config[status] ?? config.IDLE;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        borderRadius: "500px",
        padding: "2px 9px",
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.1px",
        whiteSpace: "nowrap",
      }}
    >
      {c.dot && (
        <span
          className={status === "WORKING" ? "animate-pulse-dot" : ""}
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: c.dot,
            flexShrink: 0,
          }}
        />
      )}
      {status}
    </span>
  );
}
