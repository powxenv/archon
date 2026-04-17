import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    MAX_CONCURRENT_JOBS: z.string().default("2"),
    OPENCODE_PATH: z.string().optional(),
  },

  clientPrefix: "VITE_",

  client: {
    //
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  isServer: typeof window === "undefined",
});
