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
import { userExamples } from "@/lib/openapi-examples";
import { UserSelectSchema } from "@repo/db/validators/user.validator";

const tags = ["Superadmin"];

export const createUserDoc = describeRoute({
  description: "Create a new user",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.CREATED]: createSuccessResponse("User created", {
      details: "User created successfully",
      dataSchema: z.object({
        user: UserSelectSchema,
      }),
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      validationError: {
        summary: "Invalid service token",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(userExamples.createUserValErrs),
        fields: userExamples.createUserValErrs,
      },
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.FORBIDDEN]: createGenericErrorResponse("Forbidden", {
      code: "FORBIDDEN",
      details: "User does not have the required role",
    }),
    [HttpStatusCodes.CONFLICT]: createGenericErrorResponse("User already exists", {
      code: "USER_EXISTS",
      details: "User already exists",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const changeUserRoleDoc = describeRoute({
  description: "Change the role of a user",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("User role changed", {
      details: "User role changed successfully",
      dataSchema: z.object({
        user: UserSelectSchema,
      }),
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      validationError: {
        summary: "Invalid service token",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields({
          ...userExamples.userIdValErrs,
          role: userExamples.createUserValErrs.role,
        }),
        fields: {
          ...userExamples.userIdValErrs,
          role: userExamples.createUserValErrs.role,
        },
      },
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.FORBIDDEN]: createErrorResponse("Forbidden", {
      requiredRole: {
        summary: "Required role missing",
        code: "FORBIDDEN",
        details: "User does not have the required role",
      },
      cannotChangeSelfRole: {
        summary: "Cannot change self role",
        code: "FORBIDDEN",
        details: "User cannot change their own role",
      },
      cannotChangeSuperadminRole: {
        summary: "Cannot change superadmin role",
        code: "FORBIDDEN",
        details: "User cannot change the role of a superadmin",
      },
    }),
    [HttpStatusCodes.NOT_FOUND]: createGenericErrorResponse("User not found", {
      code: "NOT_FOUND",
      details: "User not found",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const deleteUserDoc = describeRoute({
  description: "Delete a user. Cannot be undone.",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("User deleted", {
      details: "User deleted successfully",
      dataSchema: z.object({
        success: z.boolean(),
      }),
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      validationError: {
        summary: "Invalid service token",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(userExamples.userIdValErrs),
        fields: userExamples.userIdValErrs,
      },
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.FORBIDDEN]: createErrorResponse("Forbidden", {
      requiredRole: {
        summary: "Required role missing",
        code: "FORBIDDEN",
        details: "User does not have the required role",
      },
      cannotDeleteSelf: {
        summary: "Cannot delete self",
        code: "FORBIDDEN",
        details: "User cannot delete their own account",
      },
      cannotDeleteSuperadmin: {
        summary: "Cannot delete superadmin",
        code: "FORBIDDEN",
        details: "User cannot delete a superadmin",
      },
    }),
    [HttpStatusCodes.NOT_FOUND]: createGenericErrorResponse("User not found", {
      code: "NOT_FOUND",
      details: "User not found",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});
