"use client";

import { Button } from "@brigada/ui/components/button";
import { Spinner } from "@brigada/ui/components/spinner";
import { useTransition } from "react";
import { authClient } from "../lib/auth-client";

export function LogoutButton({ href }: { href: string }) {
  const [isPending, startLogout] = useTransition();

  function logOut() {
    startLogout(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess() {
            window.location.assign(href);
          },
        },
      });
    });
  }

  return (
    <Button
      className="w-full"
      disabled={isPending}
      onClick={logOut}
      variant="outline"
    >
      <span
        className="inline-flex size-4 shrink-0 items-center justify-center"
        data-icon="inline-start"
      >
        {isPending ? <Spinner /> : null}
      </span>
      Log out
    </Button>
  );
}
