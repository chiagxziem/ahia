import { z } from "zod";

import { $fetch, $fetchAndThrow } from "@/lib/fetch";
import { successResSchema } from "@/lib/schemas";
import { ListUsersQuerySchema, WindowNumberSchema } from "@repo/db/validators/admin.validator";
import {
  CategorySelectSchema,
  CategoryWithCountSchema,
} from "@repo/db/validators/product.validator";
import { UserSelectSchema } from "@repo/db/validators/user.validator";

// ── Users ──────────────────────────────────────────────────

const adminStatsSchema = z.object({
  revenue: z.object({
    value: WindowNumberSchema,
    changePct: WindowNumberSchema,
  }),
  orders: z.object({
    value: WindowNumberSchema,
    changePct: WindowNumberSchema,
  }),
  products: z.object({
    value: z.object({
      total: z.number(),
    }),
    changePct: WindowNumberSchema,
  }),
  users: z.object({
    value: z.object({
      total: z.number(),
    }),
    change: WindowNumberSchema,
  }),
});

export type AdminStats = z.infer<typeof adminStatsSchema>;

const adminUsersListSchema = z.object({
  users: z.array(UserSelectSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
});

export type AdminUsersListParams = z.infer<typeof ListUsersQuerySchema>;
export type AdminUsersListResponse = z.infer<typeof adminUsersListSchema>;
export type AdminUserRow = AdminUsersListResponse["users"][number];

export const defaultAdminUsersListParams: AdminUsersListParams = {
  limit: 100,
  offset: 0,
  sortBy: "name",
  sortDirection: "asc",
};

export const getAdminStats = async (cookie?: string) => {
  const { data, error } = await $fetch("/admin/stats", {
    output: successResSchema(adminStatsSchema),
    headers: cookie ? { cookie } : undefined,
  });

  if (error) {
    console.error(error);
    return null;
  }

  return data?.data ?? null;
};

export const getAdminUsers = async (queryParams: AdminUsersListParams = {}, cookie?: string) => {
  const validatedQueryParams = ListUsersQuerySchema.parse(queryParams);

  const { data, error } = await $fetch("/admin/users", {
    output: successResSchema(adminUsersListSchema),
    headers: cookie ? { cookie } : undefined,
    query: validatedQueryParams,
  });

  if (error) {
    console.error(error);
    return null;
  }

  return data?.data ?? null;
};

export const createAdminUser = async (body: {
  name: string;
  email: string;
  role: "user" | "admin";
}) => {
  const { data } = await $fetchAndThrow("/admin/users", {
    method: "POST",
    output: successResSchema(UserSelectSchema),
    body,
  });

  return data ?? null;
};

// ── Categories ──────────────────────────────────────────────────

const categoriesListSchema = z.array(CategoryWithCountSchema);

export type CategoryRow = z.infer<typeof CategoryWithCountSchema>;

export type CategoriesListParams = {
  page?: number;
  limit?: number;
};

export const defaultCategoriesListParams: CategoriesListParams = {
  page: 1,
  limit: 50,
};

export const getCategories = async (queryParams: CategoriesListParams = {}, cookie?: string) => {
  const { data, error } = await $fetch("/categories", {
    output: successResSchema(categoriesListSchema),
    headers: cookie ? { cookie } : undefined,
    query: queryParams,
  });

  if (error) {
    console.error(error);
    return null;
  }

  return {
    categories: data?.data ?? [],
    total: data?.pagination?.total ?? 0,
  };
};

export const createCategory = async (body: { name: string }) => {
  const { data } = await $fetchAndThrow("/categories", {
    method: "POST",
    output: successResSchema(CategorySelectSchema),
    body,
  });

  return data ?? null;
};

export const updateCategory = async ({ id, body }: { id: string; body: { name: string } }) => {
  const { data } = await $fetchAndThrow(`/categories/${id}`, {
    method: "PUT",
    output: successResSchema(CategorySelectSchema),
    body,
  });

  return data ?? null;
};

export const deleteCategory = async (id: string) => {
  const { data } = await $fetchAndThrow(`/categories/${id}`, {
    method: "DELETE",
    output: successResSchema(CategorySelectSchema),
  });

  return data ?? null;
};
