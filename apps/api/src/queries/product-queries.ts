import { count, db, desc, sql, sum } from "@repo/db";
import { orderItem } from "@repo/db/schemas/order.schema";
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
    Object.assign(p, {
      categories: productCategories?.map((pc) => pc.category) ?? [],
    }),
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
  const daySeed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
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
    Object.assign(p, {
      categories: productCategories?.map((pc) => pc.category) ?? [],
    }),
  );
};

/** Fetches product IDs ranked by total quantity sold in the last 30 days */
export const getTrendingProductIds = async (
  limit: number = 4,
): Promise<string[]> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await db
    .select({
      productId: orderItem.productId,
      totalSold: sum(orderItem.quantity).mapWith(Number),
    })
    .from(orderItem)
    .where(sql`${orderItem.createdAt} >= ${thirtyDaysAgo.toISOString()}`)
    .groupBy(orderItem.productId)
    .orderBy(sql`${sum(orderItem.quantity)} desc`)
    .limit(limit);

  return result.map((r) => r.productId);
};

/** Fetches trending products with full details (most sold in the last 30 days) */
export const getTrendingProducts = async (limit: number = 4) => {
  const topIds = await getTrendingProductIds(limit);
  if (topIds.length === 0) return [];

  const result = await db.query.product.findMany({
    where: (product, { inArray }) => inArray(product.id, topIds),
    with: {
      creator: true,
      productCategories: {
        with: { category: true },
      },
    },
  });

  if (!result) return [];

  const products = result.map(({ productCategories, ...p }) =>
    Object.assign(p, {
      categories: productCategories?.map((pc) => pc.category) ?? [],
    }),
  );

  // Preserve the trending sort order
  return topIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p != null);
};

/** Fetches products for the shop page with filtering, sorting, and pagination */
export const getShopProducts = async (params: {
  page: number;
  limit: number;
  cat?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  new?: boolean;
}) => {
  const { page, limit, cat, minPrice, maxPrice, sort: sortBy } = params;

  // Get all products with relations
  let allProducts = await db.query.product.findMany({
    with: {
      creator: true,
      productCategories: {
        with: { category: true },
      },
    },
  });

  if (!allProducts) return { products: [], total: 0 };

  let products = allProducts.map(({ productCategories, ...p }) =>
    Object.assign(p, {
      categories: productCategories?.map((pc) => pc.category) ?? [],
    }),
  );

  // Filter by category slug
  if (cat) {
    products = products.filter((p) => p.categories.some((c) => c.slug === cat));
  }

  // Filter by "new" (created in the last 14 days)
  if (params.new) {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    products = products.filter((p) => new Date(p.createdAt) >= twoWeeksAgo);
  }

  // Filter by price range
  if (minPrice != null) {
    products = products.filter((p) => parseFloat(p.price) >= minPrice);
  }
  if (maxPrice != null) {
    products = products.filter((p) => parseFloat(p.price) <= maxPrice);
  }

  // Sort
  switch (sortBy) {
    case "price-asc":
      products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      break;
    case "price-desc":
      products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      break;
    case "newest":
      products.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    default:
      // Default: newest first
      products.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
  }

  const total = products.length;
  const paginated = products.slice((page - 1) * limit, page * limit);

  return { products: paginated, total };
};
