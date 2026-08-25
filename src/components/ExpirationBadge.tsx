"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { formatRemainingTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ExpirationBadgeProps {
  expiresAt: number;
  onExpired?: () => void;
  className?: string;
}

export default function ExpirationBadge({ expiresAt, onExpired, className = "" }: ExpirationBadgeProps) {
  const [remaining, setRemaining] = useState(() => formatRemainingTime(expiresAt));

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = formatRemainingTime(expiresAt);
      setRemaining(updated);

      if (updated.isExpired) {
        clearInterval(timer);
        if (onExpired) onExpired();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpired]);

  if (remaining.isExpired) {
    return (
      <Badge variant="destructive" className={`gap-1.5 font-mono ${className}`}>
        <AlertTriangle className="h-3 w-3" />
        <span>Expirado</span>
      </Badge>
    );
  }

  const isUrgent = remaining.hours === 0 && remaining.minutes < 10;

  return (
    <Badge
      variant={isUrgent ? "amber" : "indigo"}
      className={`gap-1.5 font-mono ${className}`}
    >
      <Clock className="h-3 w-3" />
      <span>Expira em {remaining.formatted}</span>
    </Badge>
  );
}
