import { count, db } from "@repo/db";
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

  const products = result.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    stockQuantity: p.stockQuantity,
    sizes: p.sizes,
    colors: p.colors,
    images: p.images,
    createdBy: p.createdBy,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    categories: p.productCategories?.map((pc) => pc.category) ?? [],
    creator: p.creator,
  }));

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
