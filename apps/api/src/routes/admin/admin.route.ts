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
import { getAdminOrderById, getAllOrders } from "@/queries/order-queries";
import { getSessionByToken, getUserById } from "@/queries/user-queries";
import { BanUserSchema } from "@repo/db/validators/user.validator";

import {
  banUserDoc,
  changeUserPwdDoc,
  getAdminOrderDoc,
  getAllOrdersDoc,
  listUserSessionsDoc,
  listUsersDoc,
  revokeUserSessionDoc,
  revokeUserSessionsDoc,
  unbanUserDoc,
} from "./admin.docs";

const admin = createRouter()
  .use(authed)
  .use(checkRole(["admin", "superadmin"]));

// Get all orders (admin only)
admin.get("/orders", getAllOrdersDoc, async (c) => {
  try {
    const orders = await getAllOrders();

    return c.json(successResponse(orders, "All orders retrieved successfully"), HttpStatusCodes.OK);
  } catch (error) {
    console.error("Error retrieving all orders:", error);
    return c.json(
      errorResponse("INTERNAL_SERVER_ERROR", "Failed to retrieve orders"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
});

// Get order details (admin only)
admin.get(
  "/orders/:id",
  getAdminOrderDoc,
  validator("param", z.object({ id: z.uuid() }), validationHook),
  async (c) => {
    const { id } = c.req.valid("param");

    try {
      const orderWithItems = await getAdminOrderById(id);

      if (!orderWithItems) {
        return c.json(errorResponse("NOT_FOUND", "Order not found"), HttpStatusCodes.NOT_FOUND);
      }

      return c.json(
        successResponse(orderWithItems, "Order details retrieved successfully"),
        HttpStatusCodes.OK,
      );
    } catch (error) {
      console.error("Error retrieving order details:", error);
      return c.json(
        errorResponse("INTERNAL_SERVER_ERROR", "Failed to retrieve order details"),
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

// List all users
admin.get("/list-users", listUsersDoc, async (c) => {
  try {
    const result = await auth.api.listUsers({
      query: { limit: 999999999, offset: 0 },
      headers: c.req.raw.headers,
    });

    return c.json(
      successResponse(result.users, "Users retrieved successfully"),
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
});

// List user sessions
admin.post(
  "/list-user-sessions",
  listUserSessionsDoc,
  validator("json", z.object({ userId: z.string().min(1) }), validationHook),
  async (c) => {
    try {
      const user = c.get("user");
      const data = c.req.valid("json");

      const userToGetSessions = await getUserById(data.userId);

      if (!userToGetSessions) {
        return c.json(errorResponse("NOT_FOUND", "User not found"), HttpStatusCodes.NOT_FOUND);
      }

      if (userToGetSessions.role === "superadmin" && user.role !== "superadmin") {
        return c.json(
          errorResponse("FORBIDDEN", "User cannot get superadmin info"),
          HttpStatusCodes.FORBIDDEN,
        );
      }

      const response = await auth.api.listUserSessions({
        body: data,
        headers: c.req.raw.headers,
      });

      return c.json(
        successResponse(response, "User sessions retrieved successfully"),
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

// Revoke user session
admin.post(
  "/revoke-user-session",
  revokeUserSessionDoc,
  validator("json", z.object({ sessionToken: z.string().min(1) }), validationHook),
  async (c) => {
    try {
      const user = c.get("user");
      const data = c.req.valid("json");

      const sessionToBeRevoked = await getSessionByToken(data.sessionToken);

      if (!sessionToBeRevoked) {
        return c.json(errorResponse("NOT_FOUND", "Session not found"), HttpStatusCodes.NOT_FOUND);
      }

      const userToRevokeSession = await getUserById(sessionToBeRevoked.userId);

      if (!userToRevokeSession) {
        return c.json(errorResponse("NOT_FOUND", "User not found"), HttpStatusCodes.NOT_FOUND);
      }

      if (userToRevokeSession.role === "superadmin" && user.role !== "superadmin") {
        return c.json(
          errorResponse("FORBIDDEN", "User cannot revoke superadmin session"),
          HttpStatusCodes.FORBIDDEN,
        );
      }

      if (
        userToRevokeSession.role === "admin" &&
        user.role === "admin" &&
        userToRevokeSession.id !== user.id
      ) {
        return c.json(
          errorResponse("FORBIDDEN", "Admin cannot revoke fellow admin session"),
          HttpStatusCodes.FORBIDDEN,
        );
      }

      const response = await auth.api.revokeUserSession({
        body: data,
        headers: c.req.raw.headers,
      });

      return c.json(
        successResponse(response, "User session revoked successfully"),
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

// Revoke all sessions for a user
admin.post(
  "/revoke-user-sessions",
  revokeUserSessionsDoc,
  validator("json", z.object({ userId: z.string().min(1) }), validationHook),
  async (c) => {
    try {
      const user = c.get("user");
      const data = c.req.valid("json");

      const userToRevokeSessions = await getUserById(data.userId);

      if (!userToRevokeSessions) {
        return c.json(errorResponse("NOT_FOUND", "User not found"), HttpStatusCodes.NOT_FOUND);
      }

      if (userToRevokeSessions.role === "superadmin" && user.role !== "superadmin") {
        return c.json(
          errorResponse("FORBIDDEN", "User cannot revoke superadmin sessions"),
          HttpStatusCodes.FORBIDDEN,
        );
      }

      if (
        userToRevokeSessions.role === "admin" &&
        user.role === "admin" &&
        userToRevokeSessions.id !== user.id
      ) {
        return c.json(
          errorResponse("FORBIDDEN", "Admin cannot revoke fellow admin session"),
          HttpStatusCodes.FORBIDDEN,
        );
      }

      const response = await auth.api.revokeUserSessions({
        body: data,
        headers: c.req.raw.headers,
      });

      return c.json(
        successResponse(response, "All sessions for the user revoked successfully"),
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

// Change user password
admin.post(
  "/change-user-password",
  changeUserPwdDoc,
  validator(
    "json",
    z.object({
      userId: z.string().min(1),
      newPassword: z.string().min(8),
    }),
    validationHook,
  ),
  async (c) => {
    try {
      const user = c.get("user");
      const data = c.req.valid("json");

      const userToChangePwd = await getUserById(data.userId);

      if (!userToChangePwd) {
        return c.json(errorResponse("NOT_FOUND", "User not found"), HttpStatusCodes.NOT_FOUND);
      }

      if (userToChangePwd.role === "superadmin" && user.role !== "superadmin") {
        return c.json(
          errorResponse("FORBIDDEN", "User cannot change superadmin password"),
          HttpStatusCodes.FORBIDDEN,
        );
      }

      if (
        userToChangePwd.role === "admin" &&
        user.role === "admin" &&
        userToChangePwd.id !== user.id
      ) {
        return c.json(
          errorResponse("FORBIDDEN", "Admin cannot change fellow admin password"),
          HttpStatusCodes.FORBIDDEN,
        );
      }

      const response = await auth.api.setUserPassword({
        body: data,
        headers: c.req.raw.headers,
      });

      return c.json(
        successResponse(response, "User password changed successfully"),
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

// Ban user
admin.post("/ban-user", banUserDoc, validator("json", BanUserSchema, validationHook), async (c) => {
  try {
    const user = c.get("user");
    const data = c.req.valid("json");

    if (user.id === data.userId) {
      return c.json(
        errorResponse("FORBIDDEN", "User cannot ban their own account"),
        HttpStatusCodes.FORBIDDEN,
      );
    }

    const userToBeBanned = await getUserById(data.userId);

    if (!userToBeBanned) {
      return c.json(errorResponse("NOT_FOUND", "User not found"), HttpStatusCodes.NOT_FOUND);
    }

    if (userToBeBanned.role === "superadmin") {
      return c.json(
        errorResponse("FORBIDDEN", "User cannot ban a superadmin"),
        HttpStatusCodes.FORBIDDEN,
      );
    }

    if (userToBeBanned.role === "admin" && user.role === "admin") {
      return c.json(
        errorResponse("FORBIDDEN", "An admin cannot ban a fellow admin"),
        HttpStatusCodes.FORBIDDEN,
      );
    }

    const bannedUser = await auth.api.banUser({
      body: data,
      headers: c.req.raw.headers,
    });

    return c.json(successResponse(bannedUser, "User banned successfully"), HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof APIError) {
      return c.json(
        errorResponse(error.body?.code ?? "AUTH_ERROR", error.body?.message ?? error.message),
        (error.statusCode as ContentfulStatusCode) || HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    throw error;
  }
});

// Unban user
admin.post(
  "/unban-user",
  unbanUserDoc,
  validator("json", z.object({ userId: z.string().min(1) }), validationHook),
  async (c) => {
    try {
      const user = c.get("user");
      const data = c.req.valid("json");

      if (user.id === data.userId) {
        return c.json(
          errorResponse("FORBIDDEN", "User cannot unban their own account"),
          HttpStatusCodes.FORBIDDEN,
        );
      }

      const userToBeUnbanned = await getUserById(data.userId);

      if (!userToBeUnbanned) {
        return c.json(errorResponse("NOT_FOUND", "User not found"), HttpStatusCodes.NOT_FOUND);
      }

      if (userToBeUnbanned.role === "superadmin") {
        return c.json(
          errorResponse("FORBIDDEN", "User cannot unban a superadmin"),
          HttpStatusCodes.FORBIDDEN,
        );
      }

      if (userToBeUnbanned.role === "admin" && user.role === "admin") {
        return c.json(
          errorResponse("FORBIDDEN", "An admin cannot unban a fellow admin"),
          HttpStatusCodes.FORBIDDEN,
        );
      }

      const unbannedUser = await auth.api.unbanUser({
        body: data,
        headers: c.req.raw.headers,
      });

      return c.json(
        successResponse(unbannedUser, "User unbanned successfully"),
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

export default admin;
