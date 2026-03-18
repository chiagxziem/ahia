import { count, db, desc } from "@repo/db";
import { product } from "@repo/db/schemas/product.schema";

/** Fetches products with related creator and categories, plus total count */
export const getProducts = async (page: number = 1, limit?: number) => {
  let result;
  if (limit) {
    result = await db.query.product.findMany({
      with: {
        creator: true,
        productCategories: {
          with: {
            category: true,
          },
        },
      },
      limit,
      offset: (page - 1) * limit,
    });
  } else {
    result = await db.query.product.findMany({
      with: {
        creator: true,
        productCategories: {
          with: {
            category: true,
          },
        },
      },
    });
  }

  if (!result) return { products: [], total: 0 };

  const products = result.map(({ productCategories, ...p }) =>
    Object.assign(p, { categories: productCategories?.map((pc) => pc.category) ?? [] }),
  );

  const totalResult = await db.select({ count: count() }).from(product);
  const total = totalResult[0].count;

  return { products, total };
};

/** Fetches a single product with creator and categories */
export const getProductById = async (id: string) => {
  const result = await db.query.product.findFirst({
    where: (product, { eq }) => eq(product.id, id),
    with: {
      creator: true,
      productCategories: {
        with: {
          category: true,
        },
      },
    },
  });

  if (!result) return null;

  const { productCategories, ...product } = result;
  const categories = productCategories.map((pc) => pc.category);

  return { ...product, categories };
};

/** Fetches a deterministic "featured" product that changes daily */
export const getFeaturedProduct = async () => {
  const total = await db.select({ count: count() }).from(product);
  const totalProducts = total[0].count;
  if (totalProducts === 0) return null;

  // Deterministic offset from today's date (changes daily)
  const today = new Date();
  const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const offset = daySeed % totalProducts;

  const result = await db.query.product.findMany({
    with: {
      creator: true,
      productCategories: {
        with: { category: true },
      },
    },
    orderBy: (product) => product.createdAt,
    limit: 1,
    offset,
  });

  if (!result || result.length === 0) return null;

  const { productCategories, ...p } = result[0];
  return {
    ...p,
    categories: productCategories?.map((pc) => pc.category) ?? [],
  };
};

/** Fetches the N most recently created products */
export const getLatestProducts = async (limit: number = 4) => {
  const result = await db.query.product.findMany({
    with: {
      creator: true,
      productCategories: {
        with: { category: true },
      },
    },
    orderBy: (product) => desc(product.createdAt),
    limit,
  });

  if (!result) return [];

  return result.map(({ productCategories, ...p }) =>
    Object.assign(p, { categories: productCategories?.map((pc) => pc.category) ?? [] }),
  );
};
