import { describeRoute } from "hono-openapi";
import { z } from "zod";

import HttpStatusCodes from "@/lib/http-status-codes";
import {
  createErrorResponse,
  createGenericErrorResponse,
  createRateLimitErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
  getErrDetailsFromErrFields,
} from "@/lib/openapi";
import { authExamples } from "@/lib/openapi-examples";
import { UserSelectSchema } from "@repo/db/validators/user.validator";

const tags = ["Admin"];

const windowNumberSchema = z.object({
  "24h": z.number(),
  "7d": z.number(),
  "1m": z.number(),
});

export const getAllUsersDoc = describeRoute({
  description: "Get all users (admin only)",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("Users retrieved", {
      details: "Users retrieved successfully",
      dataSchema: z.object({
        users: z.array(UserSelectSchema),
        total: z.number().int().nonnegative(),
        limit: z.number().int().positive().optional(),
        offset: z.number().int().nonnegative().optional(),
      }),
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      validationError: {
        summary: "Invalid request data",
        code: "INVALID_DATA",
        details: "limit: Too small: expected number to be >0",
        fields: {
          limit: "Too small: expected number to be >0",
        },
      },
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.FORBIDDEN]: createGenericErrorResponse("Forbidden", {
      code: "FORBIDDEN",
      details: "User does not have the required permission",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const getUserDoc = describeRoute({
  description: "Get a user by id (admin only)",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("User retrieved", {
      details: "User retrieved successfully",
      dataSchema: UserSelectSchema,
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      invalidUUID: {
        summary: "Invalid user ID",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(authExamples.uuidValErr),
        fields: authExamples.uuidValErr,
      },
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.FORBIDDEN]: createGenericErrorResponse("Forbidden", {
      code: "FORBIDDEN",
      details: "User does not have the required permission",
    }),
    [HttpStatusCodes.NOT_FOUND]: createGenericErrorResponse("User not found", {
      code: "NOT_FOUND",
      details: "User not found",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const getAdminStatsDoc = describeRoute({
  description: "Get admin overview stats",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("Admin stats retrieved", {
      details: "Admin stats retrieved successfully",
      dataSchema: z.object({
        revenue: z.object({
          value: windowNumberSchema,
          changePct: windowNumberSchema,
        }),
        orders: z.object({
          value: windowNumberSchema,
          changePct: windowNumberSchema,
        }),
        products: z.object({
          value: z.object({
            total: z.number().int().nonnegative(),
          }),
          changePct: windowNumberSchema,
        }),
        users: z.object({
          value: z.object({
            total: z.number().int().nonnegative(),
          }),
          change: windowNumberSchema,
        }),
      }),
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.FORBIDDEN]: createGenericErrorResponse("Forbidden", {
      code: "FORBIDDEN",
      details: "User does not have the required permission",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});
