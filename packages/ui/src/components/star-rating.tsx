"use client";

import { StarHalfIcon, StarIcon } from "lucide-react";

export function StarRating({
  value,
  onValueChange,
  disabled,
}: {
  value: number;
  onValueChange?: (value: number) => void;
  disabled?: boolean;
}) {
  const interactive = Boolean(onValueChange) && !disabled;

  return (
    <fieldset className="m-0 flex items-center gap-0.5 border-0 p-0">
      <legend className="sr-only">{`${value / 2} out of 5`}</legend>
      {[0, 1, 2, 3, 4].map((index) => {
        const full = (index + 1) * 2;
        const half = full - 1;
        const filled = value >= full;
        const halfFilled = value >= half && !filled;

        return (
          <span className="relative inline-flex size-5" key={index}>
            {interactive ? (
              <>
                <button
                  aria-label={`${half / 2} stars`}
                  className="absolute inset-y-0 left-0 z-10 w-1/2"
                  onClick={() => onValueChange?.(half)}
                  type="button"
                />
                <button
                  aria-label={`${full / 2} stars`}
                  className="absolute inset-y-0 right-0 z-10 w-1/2"
                  onClick={() => onValueChange?.(full)}
                  type="button"
                />
              </>
            ) : null}
            {filled ? (
              <StarIcon className="size-5 fill-foreground text-foreground" />
            ) : halfFilled ? (
              <StarHalfIcon className="size-5 fill-foreground text-foreground" />
            ) : (
              <StarIcon className="size-5 text-muted-foreground" />
            )}
          </span>
        );
      })}
    </fieldset>
  );
}
