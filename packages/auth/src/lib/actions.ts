import { db } from "@repo/db";
import { cart } from "@repo/db/schemas/cart.schema";

/**
 * Creates a new cart for the specified user
 */
export const createCartForUser = async (userId: string) => {
  const [newCart] = await db
    .insert(cart)
    .values({
      userId,
    })
    .returning();

  return newCart;
};
