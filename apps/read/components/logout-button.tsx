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
    <Button disabled={isPending} onClick={logOut} size="sm" variant="ghost">
      {isPending ? <Spinner /> : null}
      Sign out
    </Button>
  );
}
