import { z } from "zod";

import { $fetch } from "@/lib/fetch";
import { successResSchema } from "@/lib/schemas";
import {
  CategoryWithCountSchema,
  ProductExtendedSchema,
} from "@repo/db/validators/product.validator";

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
