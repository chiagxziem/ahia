import { createMiddleware } from "hono/factory";

import HttpStatusCodes from "@/lib/http-status-codes";
import { errorResponse } from "@/lib/utils";
import type { AppEnv } from "@/types";

const checkRole = (requiredRole: string | string[]) => {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get("user");

    if (!user || !user.role) {
      return c.json(
        errorResponse("FORBIDDEN", "No user or role assigned"),
        HttpStatusCodes.FORBIDDEN,
      );
    }

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!roles.includes(user.role)) {
      return c.json(
        errorResponse("FORBIDDEN", "User does not have the required role"),
        HttpStatusCodes.FORBIDDEN,
      );
    }

    await next();
  });
};

export default checkRole;
