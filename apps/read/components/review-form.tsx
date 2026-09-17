"use client";

import { Button } from "@brigada/ui/components/button";
import { Input } from "@brigada/ui/components/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewForm({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(8);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-3"
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
              setError("Could not save the review. Finish the book first?");
              return;
            }
            router.refresh();
          })
          .finally(() => setPending(false));
      }}
    >
      <div className="flex flex-col gap-1 text-sm">
        <label htmlFor="review-rating">Rating (0–10, half stars)</label>
        <Input
          id="review-rating"
          max={10}
          min={0}
          onChange={(event) => setRating(Number(event.target.value))}
          type="number"
          value={rating}
        />
      </div>
      <div className="flex flex-col gap-1 text-sm">
        <label htmlFor="review-body">Review</label>
        <textarea
          className="min-h-32 rounded-lg border border-input bg-background px-3 py-2 text-sm"
          id="review-body"
          onChange={(event) => setBody(event.target.value)}
          value={body}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button disabled={pending} type="submit">
        Publish review
      </Button>
    </form>
  );
}
