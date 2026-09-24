"use client";

import { Button } from "@brigada/ui/components/button";
import { toast } from "@brigada/ui/components/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readResponseError } from "../lib/api-error";

type Participation = "reading" | "sat_out" | "dnf";

export function ParticipationForm({
  sessionStatus,
  participation,
}: {
  sessionStatus: string;
  participation: Participation;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<Participation | null>(null);
  const open = sessionStatus === "voting" || sessionStatus === "active";
  if (!open) {
    return null;
  }

  function save(next: Participation) {
    setPending(next);
    void fetch("/api/read/me/participation", {
      method: "PATCH",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ participation: next }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const message = await readResponseError(
            response,
            "Could not update your place",
          );
          toast.add({
            type: "error",
            title: "That didn’t work",
            description: message,
          });
          return;
        }
        router.refresh();
      })
      .finally(() => setPending(null));
  }

  if (participation !== "reading") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm">
          {participation === "dnf" ? "Did not finish" : "Sitting this one out"}
        </p>
        <Button
          disabled={pending !== null}
          onClick={() => save("reading")}
          variant="outline"
        >
          Reading again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        disabled={pending !== null}
        onClick={() => save("sat_out")}
        variant="outline"
      >
        Sit this one out
      </Button>
      {sessionStatus === "active" ? (
        <Button
          disabled={pending !== null}
          onClick={() => save("dnf")}
          variant="ghost"
        >
          Did not finish
        </Button>
      ) : null}
    </div>
  );
}
