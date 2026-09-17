"use client";

import { Button } from "@brigada/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@brigada/ui/components/card";
import { Spinner } from "@brigada/ui/components/spinner";
import { useState, useTransition } from "react";
import { authClient } from "../lib/auth-client";
import { DiscordIcon } from "./discord-icon";

const discordIcon = <DiscordIcon className="size-4" />;

export function SignInCard({ callbackURL }: { callbackURL: string }) {
  const [isSigningIn, startSignIn] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function signInWithDiscord() {
    startSignIn(async () => {
      setError(null);
      const result = await authClient.signIn.social({
        provider: "discord",
        callbackURL,
      });

      if (result.error) {
        setError(result.error.message ?? "Could not start Discord sign-in.");
      }
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Brigada</CardTitle>
        <CardDescription>Sign in with Discord to continue.</CardDescription>
      </CardHeader>
      {error ? (
        <CardContent>
          <CardDescription>{error}</CardDescription>
        </CardContent>
      ) : null}
      <CardFooter>
        <Button
          className="w-full"
          disabled={isSigningIn}
          onClick={signInWithDiscord}
        >
          <span
            className="inline-flex size-4 shrink-0 items-center justify-center"
            data-icon="inline-start"
          >
            {isSigningIn ? <Spinner /> : discordIcon}
          </span>
          Sign in with Discord
        </Button>
      </CardFooter>
    </Card>
  );
}
