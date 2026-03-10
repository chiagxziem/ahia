import { APIError } from "better-auth";
import { validator } from "hono-openapi";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod";

import { createRouter } from "@/app";
import HttpStatusCodes from "@/lib/http-status-codes";
import { errorResponse, successResponse } from "@/lib/utils";
import { authed } from "@/middleware/authed";
import { permit } from "@/middleware/permit";
import { validationHook } from "@/middleware/validation-hook";
import { createUser } from "@/queries/admin-queries";
import { getAdminOverviewStats } from "@/queries/stats-queries";
import { getUserById } from "@/queries/user-queries";
import { auth } from "@repo/auth/server";
import { ListUsersQuerySchema } from "@repo/db/validators/admin.validator";

import { createUserDoc, getAdminStatsDoc, getAllUsersDoc, getUserDoc } from "./admin.docs";

const admin = createRouter()
  .use(authed)
  .use(permit({ user: ["list"] }));

admin.get("/stats", getAdminStatsDoc, async (c) => {
  const stats = await getAdminOverviewStats();

  return c.json(successResponse(stats, "Admin stats retrieved successfully"), HttpStatusCodes.OK);
});

admin.get(
  "/users",
  getAllUsersDoc,
  validator("query", ListUsersQuerySchema, validationHook),
  async (c) => {
    try {
      const query = c.req.valid("query");

      const users = await auth.api.listUsers({
        query,
        headers: c.req.raw.headers,
      });

      return c.json(successResponse(users, "Users retrieved successfully"), HttpStatusCodes.OK);
    } catch (error) {
      if (error instanceof APIError) {
        return c.json(
          errorResponse(error.body?.code ?? "AUTH_ERROR", error.body?.message ?? error.message),
          error.statusCode as ContentfulStatusCode,
        );
      }
      throw error;
    }
  },
);

admin.get(
  "/users/:id",
  getUserDoc,
  validator("param", z.object({ id: z.uuid() }), validationHook),
  async (c) => {
    try {
      const { id } = c.req.valid("param");

      const user = await getUserById(id);

      if (!user) {
        return c.json(errorResponse("NOT_FOUND", "User not found"), HttpStatusCodes.NOT_FOUND);
      }

      return c.json(successResponse(user, "User retrieved successfully"), HttpStatusCodes.OK);
    } catch (error) {
      if (error instanceof APIError) {
        return c.json(
          errorResponse(error.body?.code ?? "AUTH_ERROR", error.body?.message ?? error.message),
          error.statusCode as ContentfulStatusCode,
        );
      }
      throw error;
    }
  },
);

const createUserBodySchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  role: z.enum(["user", "admin"]),
});

admin
  .use(permit({ user: ["create"] }))
  .post(
    "/users",
    createUserDoc,
    validator("json", createUserBodySchema, validationHook),
    async (c) => {
      try {
        const body = c.req.valid("json");
        const user = await createUser(body);
        return c.json(successResponse(user, "User created successfully"), HttpStatusCodes.CREATED);
      } catch (error) {
        if (error instanceof APIError) {
          return c.json(
            errorResponse(error.body?.code ?? "AUTH_ERROR", error.body?.message ?? error.message),
            error.statusCode as ContentfulStatusCode,
          );
        }
        throw error;
      }
    },
  );

export default admin;
