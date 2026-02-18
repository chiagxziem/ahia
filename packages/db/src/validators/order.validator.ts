import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { order, orderItem } from "../schemas/order.schema";
import { ProductSelectSchema } from "./product.validator";
import { UserSelectSchema } from "./user.validator";

export const OrderItemSelectSchema = createSelectSchema(orderItem).extend({
  createdAt: z
    .number()
    .transform((n) => new Date(n))
    .nullable(),
  product: ProductSelectSchema,
});

export const OrderSelectSchema = createSelectSchema(order).extend({
  createdAt: z.iso.datetime().transform((n) => new Date(n)),
  updatedAt: z.iso.datetime().transform((n) => new Date(n)),
  orderItems: OrderItemSelectSchema.array(),
});

export const OrderWithCustomerSelectSchema = createSelectSchema(order).extend({
  createdAt: z.iso.datetime().transform((n) => new Date(n)),
  updatedAt: z.iso.datetime().transform((n) => new Date(n)),
  orderItems: OrderItemSelectSchema.array(),
  customer: UserSelectSchema,
});

export const CreateCheckoutResponseSchema = z.object({
  order: OrderSelectSchema,
  checkoutUrl: z.url(),
  checkoutSessionId: z.string(),
  stripePublishableKey: z.string(),
});

export type OrderItemSelect = z.infer<typeof OrderItemSelectSchema>;
export type OrderSelect = z.infer<typeof OrderSelectSchema>;
export type CreateCheckoutResponse = z.infer<typeof CreateCheckoutResponseSchema>;
