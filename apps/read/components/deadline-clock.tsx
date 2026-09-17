"use client";

import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";

export function DeadlineClock({ deadline }: { deadline: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const closes = parseISO(deadline);
  if (now === null) {
    return (
      <p className="text-sm text-muted-foreground">
        Vote closes {format(closes, "d MMM yyyy, HH:mm")}
      </p>
    );
  }

  const remaining = closes.getTime() - now;
  if (remaining <= 0) {
    return (
      <p className="text-sm text-muted-foreground">Vote is closing now.</p>
    );
  }

  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);

  return (
    <p className="text-sm text-muted-foreground">
      Vote closes in {hours}h {minutes}m ({format(closes, "d MMM, HH:mm")})
    </p>
  );
}
