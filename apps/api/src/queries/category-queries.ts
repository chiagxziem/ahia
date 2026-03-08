import { count, db } from "@repo/db";
import { category } from "@repo/db/schemas/product.schema";

/** Fetches categories with optional pagination and total count */
export const getCategories = async (page: number = 1, limit?: number) => {
  let result;
  if (limit) {
    result = await db.query.category.findMany({
      limit,
      offset: (page - 1) * limit,
    });
  } else {
    result = await db.query.category.findMany();
  }

  if (!result) return { categories: [], total: 0 };

  const totalResult = await db.select({ count: count() }).from(category);
  const total = totalResult[0].count;

  return { categories: result, total };
};

/** Fetches a single category with its related products */
export const getCategoryById = async (id: string) => {
  const result = await db.query.category.findFirst({
    where: (category, { eq }) => eq(category.id, id),
    with: {
      productCategories: {
        with: {
          product: true,
        },
      },
    },
  });

  if (!result) return null;

  const { productCategories, ...category } = result;
  const products = productCategories.map((pc) => pc.product);

  return { ...category, products };
};
