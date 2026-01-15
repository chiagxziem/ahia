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
import { authExamples, userExamples } from "@/lib/openapi-examples";
import { SessionSelectSchema } from "@repo/db/validators/auth.validator";
import { OrderWithCustomerSelectSchema } from "@repo/db/validators/order.validator";
import { UserSelectSchema } from "@repo/db/validators/user.validator";

const tags = ["Admin"];

export const getAllOrdersDoc = describeRoute({
  description: "Get all orders (admin only)",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("All orders retrieved", {
      details: "All orders retrieved successfully",
      dataSchema: z.array(OrderWithCustomerSelectSchema),
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.FORBIDDEN]: createGenericErrorResponse("Forbidden", {
      code: "FORBIDDEN",
      details: "User does not have the required role",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const getAdminOrderDoc = describeRoute({
  description: "Get order details (admin only)",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("Order details retrieved", {
      details: "Order details retrieved successfully",
      dataSchema: OrderWithCustomerSelectSchema,
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      invalidUUID: {
        summary: "Invalid order ID",
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
      details: "User does not have the required role",
    }),
    [HttpStatusCodes.NOT_FOUND]: createGenericErrorResponse("Order not found", {
      code: "NOT_FOUND",
      details: "Order not found",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const listUsersDoc = describeRoute({
  description: "List all users",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("Users retrieved", {
      details: "Users retrieved successfully",
      dataSchema: z.array(UserSelectSchema),
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.FORBIDDEN]: createGenericErrorResponse("Forbidden", {
      code: "FORBIDDEN",
      details: "User does not have the required role",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const listUserSessionsDoc = describeRoute({
  description: "List user sessions",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("User sessions retrieved", {
      details: "User sessions retrieved successfully",
      dataSchema: z.object({
        sessions: z.array(SessionSelectSchema),
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
      superadmin: {
        summary: "Cannot get superadmin info",
        code: "FORBIDDEN",
        details: "User cannot get superadmin info",
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

export const revokeUserSessionDoc = describeRoute({
  description: "Revoke a user session",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("User session revoked", {
      details: "User session revoked successfully",
      dataSchema: z.object({
        success: z.boolean(),
      }),
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      validationError: {
        summary: "Invalid service token",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(userExamples.sessionTokenValErrs),
        fields: userExamples.sessionTokenValErrs,
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
      cannotRevokeSuperadmin: {
        summary: "Cannot revoke superadmin session",
        code: "FORBIDDEN",
        details: "User cannot revoke superadmin session",
      },
      adminCannotRevokeAdmin: {
        summary: "Admin cannot revoke fellow admin session",
        code: "FORBIDDEN",
        details: "Admin cannot revoke fellow admin session",
      },
    }),
    [HttpStatusCodes.NOT_FOUND]: createErrorResponse("Not found", {
      sessionNotFound: {
        summary: "Session not found",
        code: "SESSION_NOT_FOUND",
        details: "Session not found",
      },
      userNotFound: {
        summary: "User not found",
        code: "USER_NOT_FOUND",
        details: "User not found",
      },
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const revokeUserSessionsDoc = describeRoute({
  description: "Revoke all sessions for a user",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("All sessions for the user revoked", {
      details: "All sessions for the user revoked successfully",
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
      cannotRevokeSuperadmin: {
        summary: "Cannot revoke superadmin sessions",
        code: "FORBIDDEN",
        details: "User cannot revoke superadmin sessions",
      },
      adminCannotRevokeAdmin: {
        summary: "Admin cannot revoke fellow admin sessions",
        code: "FORBIDDEN",
        details: "Admin cannot revoke fellow admin sessions",
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

export const changeUserPwdDoc = describeRoute({
  description: "Change the password of a user",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("User password changed", {
      details: "User password changed successfully",
      dataSchema: z.object({
        status: z.boolean(),
      }),
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      validationError: {
        summary: "Invalid service token",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields({
          ...userExamples.userIdValErrs,
          newPassword: authExamples.changePwdValErrs.newPassword,
        }),
        fields: {
          ...userExamples.userIdValErrs,
          newPassword: authExamples.changePwdValErrs.newPassword,
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
      cannotChangeSuperadminPwd: {
        summary: "Cannot change superadmin password",
        code: "FORBIDDEN",
        details: "User cannot change superadmin password",
      },
      adminCannotChangeAdminPwd: {
        summary: "Admin cannot change fellow admin password",
        code: "FORBIDDEN",
        details: "Admin cannot change fellow admin password",
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

export const banUserDoc = describeRoute({
  description: "Ban a user",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("User banned", {
      details: "User banned successfully",
      dataSchema: z.object({
        user: UserSelectSchema,
      }),
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      validationError: {
        summary: "Invalid service token",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(userExamples.banUserValErrs),
        fields: userExamples.banUserValErrs,
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
      cannotBanSelf: {
        summary: "Cannot ban self",
        code: "FORBIDDEN",
        details: "User cannot ban their own account",
      },
      cannotBanSuperadmin: {
        summary: "Cannot ban superadmin",
        code: "FORBIDDEN",
        details: "User cannot ban a superadmin",
      },
      cannotBanFellowAdmin: {
        summary: "Cannot ban fellow admin",
        code: "FORBIDDEN",
        details: "An admin cannot ban a fellow admin",
      },
    }),
    [HttpStatusCodes.NOT_FOUND]: createGenericErrorResponse("User not found", {
      code: "NOT_FOUND",
      details: "User not found",
    }),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: createGenericErrorResponse("Unprocessable entity", {
      code: "UNPROCESSABLE_ENTITY",
      details: "Unprocessable entity",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const unbanUserDoc = describeRoute({
  description: "Unban a user",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("User unbanned", {
      details: "User unbanned successfully",
      dataSchema: z.object({
        user: UserSelectSchema,
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
      cannotUnbanSelf: {
        summary: "Cannot unban self",
        code: "FORBIDDEN",
        details: "User cannot unban their own account",
      },
      cannotUnbanSuperadmin: {
        summary: "Cannot unban superadmin",
        code: "FORBIDDEN",
        details: "User cannot unban a superadmin",
      },
      cannotUnbanFellowAdmin: {
        summary: "Cannot unban fellow admin",
        code: "FORBIDDEN",
        details: "An admin cannot unban a fellow admin",
      },
    }),
    [HttpStatusCodes.NOT_FOUND]: createGenericErrorResponse("User not found", {
      code: "NOT_FOUND",
      details: "User not found",
    }),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: createGenericErrorResponse("Unprocessable entity", {
      code: "UNPROCESSABLE_ENTITY",
      details: "Unprocessable entity",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});
