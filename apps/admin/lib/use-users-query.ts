"use client";

import { useQueryStates } from "nuqs";
import { usersSearchParams } from "./users-query";

export function useUsersQuery() {
  return useQueryStates(usersSearchParams, {
    history: "push",
    shallow: true,
  });
}
