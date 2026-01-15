import { APIError } from "better-auth/api";
import { validator } from "hono-openapi";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod";

import { createRouter } from "@/app";
import { auth } from "@/lib/auth";
import HttpStatusCodes from "@/lib/http-status-codes";
import { errorResponse, successResponse } from "@/lib/utils";
import { authed } from "@/middleware/authed";
import checkRole from "@/middleware/check-role";
import { validationHook } from "@/middleware/validation-hook";
import { createUser as createUserByAdmin } from "@/queries/admin-queries";
import { getUserByEmail, getUserById } from "@/queries/user-queries";
import { CreateUserSchema } from "@repo/db/validators/user.validator";

import { changeUserRoleDoc, createUserDoc, deleteUserDoc } from "./superadmin.docs";

const superadmin = createRouter().use(authed).use(checkRole("superadmin"));

// Create a new user
superadmin.post(
  "/create-user",
  createUserDoc,
  validator("json", CreateUserSchema, validationHook),
  async (c) => {
    try {
      const data = c.req.valid("json");

      const existingUser = await getUserByEmail(data.email);

      if (existingUser) {
        return c.json(
          errorResponse("USER_EXISTS", "User already exists"),
          HttpStatusCodes.CONFLICT,
        );
      }

      const newUser = await createUserByAdmin(data);

      return c.json(
        successResponse({ user: newUser }, "User created successfully"),
        HttpStatusCodes.CREATED,
      );
    } catch (error) {
      if (error instanceof APIError) {
        return c.json(
          errorResponse(error.body?.code ?? "AUTH_ERROR", error.body?.message ?? error.message),
          (error.statusCode as ContentfulStatusCode) || HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
      }

      throw error;
    }
  },
);

// Change the role of a user
superadmin.post(
  "/change-user-role",
  changeUserRoleDoc,
  validator(
    "json",
    z.object({
      userId: z.string().min(1),
      role: z.enum(["user", "admin"]),
    }),
    validationHook,
  ),
  async (c) => {
    try {
      const user = c.get("user");
      const data = c.req.valid("json");

      if (user.id === data.userId) {
        return c.json(
          errorResponse("FORBIDDEN", "User cannot change their own role"),
          HttpStatusCodes.FORBIDDEN,
        );
      }

      const userToBeChanged = await getUserById(data.userId);

      if (!userToBeChanged) {
        return c.json(errorResponse("NOT_FOUND", "User not found"), HttpStatusCodes.NOT_FOUND);
      }

      if (userToBeChanged.role === "superadmin") {
        return c.json(
          errorResponse("FORBIDDEN", "User cannot change the role of a superadmin"),
          HttpStatusCodes.FORBIDDEN,
        );
      }

      const response = await auth.api.setRole({
        body: data,
        headers: c.req.raw.headers,
      });

      return c.json(
        successResponse(response, "User role changed successfully"),
        HttpStatusCodes.OK,
      );
    } catch (error) {
      if (error instanceof APIError) {
        return c.json(
          errorResponse(error.body?.code ?? "AUTH_ERROR", error.body?.message ?? error.message),
          (error.statusCode as ContentfulStatusCode) || HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
      }

      throw error;
    }
  },
);

// Delete a user
superadmin.delete(
  "/delete-user",
  deleteUserDoc,
  validator("json", z.object({ userId: z.string().min(1) }), validationHook),
  async (c) => {
    try {
      const user = c.get("user");
      const data = c.req.valid("json");

      if (user.id === data.userId) {
        return c.json(
          errorResponse("FORBIDDEN", "User cannot delete their own account"),
          HttpStatusCodes.FORBIDDEN,
        );
      }

      const userToBeDeleted = await getUserById(data.userId);

      if (!userToBeDeleted) {
        return c.json(errorResponse("NOT_FOUND", "User not found"), HttpStatusCodes.NOT_FOUND);
      }

      if (userToBeDeleted.role === "superadmin") {
        return c.json(
          errorResponse("FORBIDDEN", "User cannot delete a superadmin"),
          HttpStatusCodes.FORBIDDEN,
        );
      }

      await auth.api.removeUser({
        body: {
          userId: userToBeDeleted.id,
        },
        headers: c.req.raw.headers,
      });

      return c.json(
        successResponse({ success: true }, "User deleted successfully"),
        HttpStatusCodes.OK,
      );
    } catch (error) {
      if (error instanceof APIError) {
        return c.json(
          errorResponse(error.body?.code ?? "AUTH_ERROR", error.body?.message ?? error.message),
          (error.statusCode as ContentfulStatusCode) || HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
      }

      throw error;
    }
  },
);

export default superadmin;
