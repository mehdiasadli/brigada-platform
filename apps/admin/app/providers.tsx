"use client";

import { Toaster, toast } from "@brigada/ui/components/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode, useState } from "react";
import { errorMessage } from "../lib/api-error";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
          mutations: {
            onError: (error) => {
              toast.add({
                type: "error",
                title: "That didn’t work",
                description: errorMessage(error),
              });
            },
          },
        },
      }),
  );

  return (
    <Toaster>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </NuqsAdapter>
    </Toaster>
  );
}
