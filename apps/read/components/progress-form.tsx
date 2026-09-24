"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@brigada/ui/components/alert";
import { Button } from "@brigada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@brigada/ui/components/dialog";
import { Field, FieldGroup, FieldLabel } from "@brigada/ui/components/field";
import { NumberInput } from "@brigada/ui/components/number-input";
import { Textarea } from "@brigada/ui/components/textarea";
import { toast } from "@brigada/ui/components/toast";
import { CircleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readResponseError } from "../lib/api-error";

export function ProgressForm({
  bookId,
  initialPercentage,
  initialNotes,
}: {
  bookId?: string;
  initialPercentage: number;
  initialNotes: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [percentage, setPercentage] = useState<number | null>(
    initialPercentage,
  );
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (initialPercentage >= 100) {
    return (
      <div className="flex flex-wrap items-end justify-between gap-4 border-y border-foreground/15 py-4">
        <p className="text-5xl font-semibold tracking-tight">Finished</p>
        <Button
          disabled={pending}
          onClick={() => {
            setPending(true);
            setError(null);
            void fetch("/api/read/me/progress", {
              method: "PATCH",
              credentials: "include",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                bookId,
                percentage: 99,
                notes: initialNotes,
              }),
            })
              .then(async (response) => {
                if (!response.ok) {
                  const message = await readResponseError(
                    response,
                    "Could not update progress",
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
          size="sm"
          variant="ghost"
        >
          Not finished
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 border-y border-foreground/15 py-4">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-5xl font-semibold tabular-nums tracking-tight">
            {initialPercentage}
            <span className="text-xl text-muted-foreground">%</span>
          </p>
          {initialNotes ? (
            <p className="max-w-xs text-sm text-muted-foreground">
              {initialNotes}
            </p>
          ) : null}
        </div>
        <Button
          onClick={() => {
            setPercentage(initialPercentage);
            setNotes(initialNotes ?? "");
            setError(null);
            setOpen(true);
          }}
        >
          Update progress
        </Button>
      </div>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update progress</DialogTitle>
            <DialogDescription>
              Set 100 to finish the book. Notes stay private.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (percentage === null) {
                return;
              }
              setPending(true);
              setError(null);
              void fetch("/api/read/me/progress", {
                method: "PATCH",
                credentials: "include",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  bookId,
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
                  setOpen(false);
                  router.refresh();
                })
                .finally(() => setPending(false));
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="progress-percentage">Progress</FieldLabel>
                <NumberInput
                  id="progress-percentage"
                  max={100}
                  min={0}
                  onValueChange={setPercentage}
                  value={percentage}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="progress-notes">Private notes</FieldLabel>
                <Textarea
                  id="progress-notes"
                  onChange={(event) => setNotes(event.target.value)}
                  value={notes}
                />
              </Field>
            </FieldGroup>
            {error ? (
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertTitle>That didn’t work</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <DialogFooter>
              <Button disabled={pending || percentage === null} type="submit">
                Save progress
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
