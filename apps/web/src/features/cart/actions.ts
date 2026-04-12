"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { CartSelectSchema } from "@repo/db/validators/cart.validator";
import { OrderSelectSchema } from "@repo/db/validators/order.validator";

import { $fetch, $fetchAndThrow } from "@/lib/fetch";
import { successResSchema } from "@/lib/schemas";

const cartOutputSchema = successResSchema(CartSelectSchema);

type CartResponse = z.infer<typeof CartSelectSchema>;

export const getCart = async (): Promise<CartResponse | null> => {
  const headersList = await headers();

  const { data, error } = await $fetch("/cart", {
    headers: {
      cookie: headersList.get("cookie") ?? "",
    },
    output: cartOutputSchema,
  });

  if (error) {
    console.error(error);
    return null;
  }

  return data?.data ?? null;
};

export const updateCartItemQuantity = async ({
  itemId,
  quantity,
}: {
  itemId: string;
  quantity: number;
}) => {
  const headersList = await headers();

  return await $fetchAndThrow(`/cart/items/${itemId}`, {
    method: "PUT",
    headers: {
      cookie: headersList.get("cookie") ?? "",
    },
    body: { quantity },
    output: cartOutputSchema,
  });
};

export const removeCartItem = async (itemId: string) => {
  const headersList = await headers();

  return await $fetchAndThrow(`/cart/items/${itemId}`, {
    method: "DELETE",
    headers: {
      cookie: headersList.get("cookie") ?? "",
    },
    output: cartOutputSchema,
  });
};

export const clearCart = async () => {
  const headersList = await headers();

  return await $fetchAndThrow("/cart", {
    method: "DELETE",
    headers: {
      cookie: headersList.get("cookie") ?? "",
    },
    output: cartOutputSchema,
  });
};

export const createCheckout = async () => {
  const headersList = await headers();

  return await $fetchAndThrow("/orders/create-checkout", {
    method: "POST",
    headers: {
      cookie: headersList.get("cookie") ?? "",
    },
    output: successResSchema(
      z.object({
        checkoutUrl: z.url(),
        checkoutSessionId: z.string(),
      }),
    ),
  });
};

export const verifyCheckoutSession = async (sessionId: string) => {
  const headersList = await headers();

  return await $fetchAndThrow("/orders/verify-session", {
    method: "POST",
    headers: {
      cookie: headersList.get("cookie") ?? "",
    },
    body: { sessionId },
    output: successResSchema(OrderSelectSchema),
  });
};
