"use client";

import { cn } from "@brigada/ui/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { openLibraryCoverUrl } from "../lib/cover";

function CoverPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex size-full items-end bg-muted p-3">
      <p className="line-clamp-4 text-xs font-medium leading-snug text-muted-foreground">
        {title}
      </p>
    </div>
  );
}

export function BookCover({
  title,
  coverId,
  className,
  priority = false,
  alt = "",
}: {
  title: string;
  coverId: number | null;
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  const src = openLibraryCoverUrl(coverId);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn("relative aspect-2/3 overflow-hidden bg-muted", className)}
    >
      {src && !failed ? (
        <Image
          alt={alt}
          className="object-cover"
          fill
          onError={() => setFailed(true)}
          priority={priority}
          sizes="(min-width: 1024px) 16rem, (min-width: 768px) 25vw, 50vw"
          src={src}
        />
      ) : (
        <CoverPlaceholder title={title} />
      )}
    </div>
  );
}
