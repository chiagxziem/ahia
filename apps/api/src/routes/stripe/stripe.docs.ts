import { describeRoute } from "hono-openapi";
import { z } from "zod";

import HttpStatusCodes from "@/lib/http-status-codes";
import {
  createErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
} from "@/lib/openapi";

const tags = ["Webhooks"];

export const stripeWebhookDoc = describeRoute({
  description: "Handle Stripe webhook events",
  tags,
  hide: true, // Hide from OpenAPI documentation
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("Webhook processed", {
      details: "Webhook processed successfully",
      dataSchema: z.object({
        received: z.boolean(),
      }),
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request", {
      invalidWebhook: {
        summary: "Invalid webhook",
        code: "BAD_REQUEST",
        details: "Invalid webhook signature or payload",
      },
      missingStripeSignature: {
        summary: "Missing Stripe signature",
        code: "BAD_REQUEST",
        details: "Missing Stripe signature in request headers",
      },
    }),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});
