"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@brigada/ui/components/alert";
import { Button } from "@brigada/ui/components/button";
import { Input } from "@brigada/ui/components/input";
import { toast } from "@brigada/ui/components/toast";
import { CircleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readResponseError } from "../lib/api-error";

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
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        void fetch("/api/read/me/progress", {
          method: "PATCH",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            percentage,
            notes: notes.trim() || null,
          }),
        })
          .then(async (response) => {
            if (!response.ok) {
              const message = await readResponseError(
                response,
                "Could not save progress",
              );
              setError(message);
              toast.add({
                type: "error",
                title: "That didn’t work",
                description: message,
              });
              return;
            }
            router.refresh();
          })
          .finally(() => setPending(false));
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
      {error ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>That didn’t work</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button disabled={pending} type="submit">
        Save progress
      </Button>
    </form>
  );
}
