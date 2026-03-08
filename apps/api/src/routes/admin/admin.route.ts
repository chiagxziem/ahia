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
import { getUserById } from "@/queries/user-queries";
import { auth } from "@repo/auth/server";

import { getAllUsersDoc, getUserDoc } from "./admin.docs";

const listUsersQuerySchema = z.object({
  searchValue: z.string().optional(),
  searchField: z.enum(["email", "name"]).optional(),
  searchOperator: z.enum(["contains", "starts_with", "ends_with"]).optional(),
  limit: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  filterField: z.string().optional(),
  filterValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  filterOperator: z.enum(["eq", "ne", "lt", "lte", "gt", "gte", "contains"]).optional(),
});

const admin = createRouter()
  .use(authed)
  .use(permit({ user: ["list"] }));

admin.get(
  "/users",
  getAllUsersDoc,
  validator("query", listUsersQuerySchema, validationHook),
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

export default admin;
