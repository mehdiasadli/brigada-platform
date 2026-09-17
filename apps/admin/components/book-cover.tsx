"use client";

import { cn } from "@brigada/ui/lib/utils";
import { useState } from "react";
import { openLibraryCoverUrl } from "../lib/cover";

function CoverPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex size-full flex-col justify-end border-l-2 border-border bg-muted px-1.5 py-1.5">
      <p className="line-clamp-4 text-[0.65rem] font-medium leading-tight text-muted-foreground">
        {title}
      </p>
    </div>
  );
}

export function BookCover({
  title,
  coverId,
  className,
}: {
  title: string;
  coverId: number | null | undefined;
  className?: string;
}) {
  const src = openLibraryCoverUrl(coverId);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn("relative aspect-2/3 overflow-hidden bg-muted", className)}
    >
      {src && !failed ? (
        // biome-ignore lint/performance/noImgElement: admin client covers are remote OpenLibrary thumbs
        <img
          alt=""
          className="size-full object-cover"
          onError={() => setFailed(true)}
          src={src}
        />
      ) : (
        <CoverPlaceholder title={title} />
      )}
    </div>
  );
}
