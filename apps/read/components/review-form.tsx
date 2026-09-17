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
import { StarRating } from "@brigada/ui/components/star-rating";
import { Textarea } from "@brigada/ui/components/textarea";
import { toast } from "@brigada/ui/components/toast";
import { CircleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readResponseError } from "../lib/api-error";

export function ReviewForm({
  bookId,
  defaultOpen = false,
}: {
  bookId: string;
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [rating, setRating] = useState(8);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Button
        onClick={() => {
          setRating(8);
          setBody("");
          setError(null);
          setOpen(true);
        }}
      >
        Write a review
      </Button>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Write a review</DialogTitle>
            <DialogDescription>
              Rate the book in half stars. You can add a note if you want.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setPending(true);
              setError(null);
              void fetch("/api/read/me/reviews", {
                method: "POST",
                credentials: "include",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  bookId,
                  rating,
                  body: body.trim() || null,
                }),
              })
                .then(async (response) => {
                  if (!response.ok) {
                    const message = await readResponseError(
                      response,
                      "Could not save the review",
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
                <FieldLabel>Rating</FieldLabel>
                <div className="flex items-center gap-3">
                  <StarRating onValueChange={setRating} value={rating} />
                  <span className="text-sm text-muted-foreground">
                    {rating / 2} / 5
                  </span>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="review-body">Review</FieldLabel>
                <Textarea
                  id="review-body"
                  onChange={(event) => setBody(event.target.value)}
                  value={body}
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
              <Button disabled={pending} type="submit">
                Publish review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
