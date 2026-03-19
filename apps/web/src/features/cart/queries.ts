import { z } from "zod";

import { $fetch, $fetchAndThrow } from "@/lib/fetch";
import { successResSchema } from "@/lib/schemas";
import { CartSelectSchema } from "@repo/db/validators/cart.validator";

const cartOutputSchema = successResSchema(CartSelectSchema);

export const getCart = async () => {
  const { data, error } = await $fetch("/cart", {
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
  return await $fetchAndThrow(`/cart/items/${itemId}`, {
    method: "PUT",
    body: { quantity },
    output: cartOutputSchema,
  });
};

export const removeCartItem = async (itemId: string) => {
  return await $fetchAndThrow(`/cart/items/${itemId}`, {
    method: "DELETE",
    output: cartOutputSchema,
  });
};

export const clearCart = async () => {
  return await $fetchAndThrow("/cart", {
    method: "DELETE",
    output: cartOutputSchema,
  });
};

export const createCheckout = async () => {
  return await $fetchAndThrow("/orders/create-checkout", {
    method: "POST",
    output: successResSchema(
      z.object({
        checkoutUrl: z.url(),
        checkoutSessionId: z.string(),
      }),
    ),
  });
};
