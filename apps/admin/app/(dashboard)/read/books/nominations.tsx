"use client";

import { Button } from "@brigada/ui/components/button";
import { toast } from "@brigada/ui/components/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActionError, firstError } from "../../../../components/action-error";
import {
  listReadNominations,
  readNominationsQueryKey,
  setReadNominationStatus,
} from "../../../../lib/read-admin";

export function OpenNominations() {
  const queryClient = useQueryClient();
  const nominations = useQuery({
    queryKey: readNominationsQueryKey(),
    queryFn: listReadNominations,
  });
  const close = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "parked" | "rejected";
    }) => setReadNominationStatus(id, status),
    onSuccess: (_result, variables) => {
      toast.add({
        type: "success",
        title:
          variables.status === "parked"
            ? "Nomination parked"
            : "Nomination rejected",
      });
      void queryClient.invalidateQueries({
        queryKey: readNominationsQueryKey(),
      });
    },
  });

  if (!nominations.data?.length && !nominations.error && !close.error) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-medium">Open nominations</h2>
        <p className="text-sm text-muted-foreground">
          Park or reject a pitch. The book stays in the catalog.
        </p>
      </div>
      <ActionError error={firstError(nominations.error, close.error)} />
      <ul className="flex flex-col">
        {(nominations.data ?? []).map((nomination) => (
          <li
            className="flex flex-col gap-3 border-b py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between"
            key={nomination.id}
          >
            <div className="flex min-w-0 flex-col gap-1">
              <p className="font-medium">{nomination.bookTitle}</p>
              <p className="text-sm text-muted-foreground">
                {nomination.bookAuthor} · {nomination.nominatorName}
              </p>
              <p className="text-sm">{nomination.reason}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                disabled={close.isPending}
                onClick={() =>
                  close.mutate({ id: nomination.id, status: "parked" })
                }
                size="sm"
                variant="outline"
              >
                Park
              </Button>
              <Button
                disabled={close.isPending}
                onClick={() =>
                  close.mutate({ id: nomination.id, status: "rejected" })
                }
                size="sm"
                variant="outline"
              >
                Reject
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
