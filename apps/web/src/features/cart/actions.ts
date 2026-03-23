"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { CartSelectSchema } from "@repo/db/validators/cart.validator";

import { $fetchAndThrow } from "@/lib/fetch";
import { successResSchema } from "@/lib/schemas";

const cartOutputSchema = successResSchema(CartSelectSchema);

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
