import { createMiddleware } from "hono/factory";

import HttpStatusCodes from "@/lib/http-status-codes";
import { errorResponse } from "@/lib/utils";
import type { AppEnv } from "@/types";
import { auth } from "@repo/auth/server";

export const authed = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json(errorResponse("UNAUTHORIZED", "No session found"), HttpStatusCodes.UNAUTHORIZED);
  }

  c.set("user", session.user);

  return next();
});
