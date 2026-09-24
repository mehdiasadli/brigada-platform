"use client";

import { Button } from "@brigada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@brigada/ui/components/dialog";
import { useState } from "react";
import type { MemberSession } from "../lib/read-types";
import { VoteChoice } from "./vote-choice";

type Choice = MemberSession["candidates"][number];

export function AlsoOnTheVote({
  title,
  choices,
}: {
  title: string;
  choices: Choice[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        {title}
      </Button>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <ol>
            {choices.map((choice, index) => (
              <VoteChoice
                choice={choice}
                index={index + 1}
                key={choice.slug ?? choice.title}
              />
            ))}
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}
