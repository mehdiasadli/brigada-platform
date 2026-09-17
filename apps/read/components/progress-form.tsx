"use client";

import { Button } from "@brigada/ui/components/button";
import { Input } from "@brigada/ui/components/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProgressForm({
  initialPercentage,
  initialNotes,
}: {
  initialPercentage: number;
  initialNotes: string | null;
}) {
  const router = useRouter();
  const [percentage, setPercentage] = useState(initialPercentage);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
        void fetch("/api/read/me/progress", {
          method: "PATCH",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            percentage,
            notes: notes.trim() || null,
          }),
        }).finally(() => {
          setPending(false);
          router.refresh();
        });
      }}
    >
      <div className="flex flex-col gap-1 text-sm">
        <label htmlFor="progress-percentage">Progress</label>
        <Input
          id="progress-percentage"
          max={100}
          min={0}
          onChange={(event) => setPercentage(Number(event.target.value))}
          type="number"
          value={percentage}
        />
      </div>
      <div className="flex flex-col gap-1 text-sm">
        <label htmlFor="progress-notes">Notes</label>
        <Input
          id="progress-notes"
          onChange={(event) => setNotes(event.target.value)}
          value={notes}
        />
      </div>
      <Button disabled={pending} type="submit">
        Save progress
      </Button>
    </form>
  );
}
