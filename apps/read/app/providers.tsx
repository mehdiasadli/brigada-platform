"use client";

import { Toaster } from "@brigada/ui/components/toast";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <Toaster>{children}</Toaster>;
}
