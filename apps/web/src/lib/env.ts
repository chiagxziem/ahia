import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const env = createEnv({
  server: {
    API_URL: z.string().min(1),
    WEB_URL: z.string().min(1),
    DATABASE_URL: z.url(),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().min(1),
  },
  experimental__runtimeEnv: {
    ...process.env,
    // client variables must be explicitly passed
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  emptyStringAsUndefined: true,
});

export default env;
