import { z } from "zod";

import {
  CategoryWithCountSchema,
  ProductExtendedSchema,
} from "@repo/db/validators/product.validator";

import { $fetch, $fetchAndThrow } from "@/lib/fetch";
import { successResSchema } from "@/lib/schemas";

// ── Single Product ───────────────────────────────────────────

export const getProductById = async (id: string, cookie?: string) => {
  const { data, error } = await $fetch(`/products/${id}`, {
    output: successResSchema(ProductExtendedSchema),
    headers: cookie ? { cookie } : undefined,
  });

  if (error) {
    console.error(error);
    return null;
  }

  return data?.data ?? null;
};

// ── Related Products ─────────────────────────────────────────

export const getRelatedProducts = async (
  productId: string,
  categorySlug: string | undefined,
  cookie?: string,
) => {
  // Try same category first
  const { data } = await $fetch("/products/shop", {
    output: successResSchema(z.array(ProductExtendedSchema)),
    headers: cookie ? { cookie } : undefined,
    query: { ...(categorySlug ? { cat: categorySlug } : {}), limit: 5 },
  });

  let products = (data?.data ?? []).filter((p) => p.id !== productId);

  // If not enough from same category, fetch random products
  if (products.length < 4) {
    const { data: fallback } = await $fetch("/products/shop", {
      output: successResSchema(z.array(ProductExtendedSchema)),
      headers: cookie ? { cookie } : undefined,
      query: { limit: 8 },
    });

    const existing = new Set(products.map((p) => p.id));
    existing.add(productId);
    const extras = (fallback?.data ?? []).filter((p) => !existing.has(p.id));
    products = [...products, ...extras];
  }

  return products.slice(0, 4);
};

// ── Add To Cart ──────────────────────────────────────────────

export const addToCart = async ({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}) => {
  return await $fetchAndThrow("/cart/items", {
    method: "POST",
    body: { productId, quantity },
    output: successResSchema(z.any()),
  });
};

// ── Featured Product ──────────────────────────────────────────

export const getFeaturedProduct = async (cookie?: string) => {
  const { data, error } = await $fetch("/products/featured", {
    output: successResSchema(ProductExtendedSchema),
    headers: cookie ? { cookie } : undefined,
  });

  if (error) {
    console.error(error);
    return null;
  }

  return data?.data ?? null;
};

// ── Latest Products ──────────────────────────────────────────

export const getLatestProducts = async (cookie?: string) => {
  const { data, error } = await $fetch("/products/latest", {
    output: successResSchema(z.array(ProductExtendedSchema)),
    headers: cookie ? { cookie } : undefined,
  });

  if (error) {
    console.error(error);
    return null;
  }

  return data?.data ?? [];
};

// ── Trending Products ────────────────────────────────────────

export const getTrendingProducts = async (cookie?: string) => {
  const { data, error } = await $fetch("/products/trending", {
    output: successResSchema(z.array(ProductExtendedSchema)),
    headers: cookie ? { cookie } : undefined,
  });

  if (error) {
    console.error(error);
    return null;
  }

  return data?.data ?? [];
};

// ── Top Categories ──────────────────────────────────────────

export const getTopCategories = async (cookie?: string) => {
  const { data, error } = await $fetch("/categories/top", {
    output: successResSchema(z.array(CategoryWithCountSchema)),
    headers: cookie ? { cookie } : undefined,
  });

  if (error) {
    console.error(error);
    return null;
  }

  return data?.data ?? [];
};

// ── All Categories (for shop filter) ──────────────────────────

export const getAllCategories = async (cookie?: string) => {
  const { data, error } = await $fetch("/categories", {
    output: successResSchema(z.array(CategoryWithCountSchema)),
    headers: cookie ? { cookie } : undefined,
  });

  if (error) {
    console.error(error);
    return null;
  }

  return data?.data ?? [];
};

// ── Shop Products (filtered, sorted, paginated) ─────────────

export type ShopProductsParams = {
  page?: number;
  limit?: number;
  cat?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  new?: boolean;
};

const ShopProductsResponseSchema = successResSchema(
  z.array(ProductExtendedSchema),
);

export const getShopProducts = async (
  params: ShopProductsParams = {},
  cookie?: string,
) => {
  const query: Record<string, string | number | boolean> = {};
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  if (params.cat) query.cat = params.cat;
  if (params.minPrice != null) query.minPrice = params.minPrice;
  if (params.maxPrice != null) query.maxPrice = params.maxPrice;
  if (params.sort) query.sort = params.sort;
  if (params.new) query.new = "true";

  const { data, error } = await $fetch("/products/shop", {
    output: ShopProductsResponseSchema,
    headers: cookie ? { cookie } : undefined,
    query,
  });

  if (error) {
    console.error(error);
    return { products: [], pagination: undefined };
  }

  return {
    products: data?.data ?? [],
    pagination: data?.pagination,
  };
};
