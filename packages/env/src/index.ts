import { createEnv as createEnvCore } from "@t3-oss/env-core";

export { z } from "zod";

export const createEnv: typeof createEnvCore = (opts) =>
  createEnvCore({
    emptyStringAsUndefined: true,
    ...opts,
  });
