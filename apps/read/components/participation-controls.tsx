"use client";

import { Button } from "@brigada/ui/components/button";
import { ConfirmDialog } from "@brigada/ui/components/confirm-dialog";
import { toast } from "@brigada/ui/components/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readResponseError } from "../lib/api-error";
import type { MemberSessionReader } from "../lib/read-types";

export function ParticipationControls({
  mine,
  sessionStatus,
}: {
  mine: MemberSessionReader | undefined;
  sessionStatus: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirm, setConfirm] = useState<"sat_out" | "dnf" | "reading" | null>(
    null,
  );

  if (!mine) {
    return null;
  }

  function apply(status: "sat_out" | "dnf" | "reading") {
    setPending(true);
    void fetch("/api/read/me/participation", {
      method: "PATCH",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const message = await readResponseError(
            response,
            "Could not update your status",
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
      .finally(() => {
        setPending(false);
        setConfirm(null);
      });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {mine.participation === "reading" ? (
        <Button
          onClick={() => setConfirm("sat_out")}
          size="sm"
          variant="outline"
        >
          Sit this one out
        </Button>
      ) : (
        <Button
          onClick={() => setConfirm("reading")}
          size="sm"
          variant="outline"
        >
          I am reading
        </Button>
      )}
      {sessionStatus === "active" && mine.participation !== "dnf" ? (
        <Button onClick={() => setConfirm("dnf")} size="sm" variant="ghost">
          Did not finish
        </Button>
      ) : null}
      <ConfirmDialog
        confirmLabel="Confirm"
        description={
          confirm === "dnf"
            ? "You will stay on the board as did not finish."
            : confirm === "sat_out"
              ? "You will leave the progress board for this session."
              : "You will show up on the progress board again."
        }
        onConfirm={() => {
          if (confirm) {
            apply(confirm);
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setConfirm(null);
          }
        }}
        open={confirm !== null}
        pending={pending}
        title={
          confirm === "dnf"
            ? "Mark as did not finish?"
            : confirm === "sat_out"
              ? "Sit this session out?"
              : "Back on the roster?"
        }
      />
    </div>
  );
}
