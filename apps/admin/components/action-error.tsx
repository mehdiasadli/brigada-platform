"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@brigada/ui/components/alert";
import { CircleAlertIcon } from "lucide-react";

export function ActionError({ error }: { error: Error | null }) {
  if (!error) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>That didn’t work</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}

export function firstError(
  ...errors: Array<Error | null | undefined>
): Error | null {
  return errors.find((error) => error != null) ?? null;
}
