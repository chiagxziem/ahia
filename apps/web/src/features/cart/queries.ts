import { CartSelectSchema } from "@repo/db/validators/cart.validator";

import { $fetch } from "@/lib/fetch";
import { successResSchema } from "@/lib/schemas";

export const getCart = async () => {
  const { data, error } = await $fetch("/cart", {
    output: successResSchema(CartSelectSchema),
  });

  if (error) {
    console.error(error);
    return null;
  }

  return data?.data ?? null;
};
