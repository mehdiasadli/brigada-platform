import { createLoader, parseAsString } from "nuqs/server";

export const authSearchParams = {
  ref_url: parseAsString,
};

export const loadAuthSearchParams = createLoader(authSearchParams);
