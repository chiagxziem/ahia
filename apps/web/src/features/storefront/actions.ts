"use server";

import { headers } from "next/headers";

import { CartSelectSchema } from "@repo/db/validators/cart.validator";

import { $fetchAndThrow } from "@/lib/fetch";
import { successResSchema } from "@/lib/schemas";

// ── Add To Cart ──────────────────────────────────────────────

export const addToCart = async ({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}) => {
  const headersList = await headers();

  return await $fetchAndThrow("/cart/items", {
    method: "POST",
    headers: {
      cookie: headersList.get("cookie") ?? "",
    },
    body: { productId, quantity },
    output: successResSchema(CartSelectSchema),
  });
};
