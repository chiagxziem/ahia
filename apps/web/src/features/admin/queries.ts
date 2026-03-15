import { z } from "zod";

import { $fetch, $fetchAndThrow } from "@/lib/fetch";
import { successResSchema } from "@/lib/schemas";
import { ListUsersQuerySchema, WindowNumberSchema } from "@repo/db/validators/admin.validator";
import { OrderWithCustomerSelectSchema } from "@repo/db/validators/order.validator";
import {
  CategorySelectSchema,
  CategoryWithCountSchema,
  ProductExtendedSchema,
} from "@repo/db/validators/product.validator";
import { UserSelectSchema } from "@repo/db/validators/user.validator";

// ── Users ──────────────────────────────────────────────────

const AdminStatsSchema = z.object({
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

export type AdminStats = z.infer<typeof AdminStatsSchema>;

const AdminUsersListSchema = z.object({
  users: z.array(UserSelectSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
});

export type AdminUsersListParams = z.infer<typeof ListUsersQuerySchema>;
export type AdminUsersListResponse = z.infer<typeof AdminUsersListSchema>;
export type AdminUserRow = AdminUsersListResponse["users"][number];

export const defaultAdminUsersListParams: AdminUsersListParams = {
  limit: 100,
  offset: 0,
  sortBy: "name",
  sortDirection: "asc",
};

export const getAdminStats = async (cookie?: string) => {
  const { data, error } = await $fetch("/admin/stats", {
    output: successResSchema(AdminStatsSchema),
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
    output: successResSchema(AdminUsersListSchema),
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

const AdminCategoriesListSchema = z.array(CategoryWithCountSchema);

export type AdminCategoryRow = z.infer<typeof CategoryWithCountSchema>;

export type AdminCategoriesListParams = {
  page?: number;
  limit?: number;
};

export const defaultAdminCategoriesListParams: AdminCategoriesListParams = {
  page: 1,
  limit: 50,
};

export const getAdminCategories = async (
  queryParams: AdminCategoriesListParams = {},
  cookie?: string,
) => {
  const { data, error } = await $fetch("/categories", {
    output: successResSchema(AdminCategoriesListSchema),
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

// ── Products ──────────────────────────────────────────────────

const ProductsAdminListSchema = z.array(ProductExtendedSchema);

export type AdminProductRow = z.infer<typeof ProductExtendedSchema>;

export type AdminProductsListParams = {
  page?: number;
  limit?: number;
};

export const defaultAdminProductsListParams: AdminProductsListParams = {
  page: 1,
  limit: 50,
};

export const getAdminProducts = async (
  queryParams: AdminProductsListParams = {},
  cookie?: string,
) => {
  const { data, error } = await $fetch("/products", {
    output: successResSchema(ProductsAdminListSchema),
    headers: cookie ? { cookie } : undefined,
    query: queryParams,
  });

  if (error) {
    console.error(error);
    return null;
  }

  return {
    products: data?.data ?? [],
    total: data?.pagination?.total ?? 0,
  };
};

export interface CreateAdminProductInput {
  name: string;
  description?: string;
  price: string;
  stockQuantity: string;
  categoryIds: string[];
  sizes?: { name: string; inStock: boolean }[];
  colors?: { name: string; inStock: boolean }[];
  images: File[];
  createdBy: string;
}

export const createAdminProduct = async (input: CreateAdminProductInput) => {
  const formData = new FormData();
  formData.append("name", input.name);
  if (input.description) formData.append("description", input.description);
  formData.append("price", input.price);
  formData.append("stockQuantity", input.stockQuantity);
  formData.append("createdBy", input.createdBy);
  formData.append("categoryIds", JSON.stringify(input.categoryIds));
  if (input.sizes && input.sizes.length > 0) {
    formData.append("sizes", JSON.stringify(input.sizes));
  }
  if (input.colors && input.colors.length > 0) {
    formData.append("colors", JSON.stringify(input.colors));
  }
  for (const image of input.images) {
    formData.append("images", image);
  }

  const { data } = await $fetchAndThrow("/products", {
    method: "POST",
    output: successResSchema(ProductExtendedSchema),
    body: formData,
  });

  return data ?? null;
};

export interface UpdateAdminProductInput {
  name?: string;
  description?: string;
  price?: string;
  stockQuantity?: string;
  categoryIds?: string[];
  sizes?: { name: string; inStock: boolean }[];
  colors?: { name: string; inStock: boolean }[];
  keepImageKeys?: string[];
  newImages?: File[];
}

export const updateAdminProduct = async ({
  id,
  input,
}: {
  id: string;
  input: UpdateAdminProductInput;
}) => {
  const formData = new FormData();
  if (input.name !== undefined) formData.append("name", input.name);
  if (input.description !== undefined) formData.append("description", input.description);
  if (input.price !== undefined) formData.append("price", input.price);
  if (input.stockQuantity !== undefined) formData.append("stockQuantity", input.stockQuantity);
  if (input.categoryIds !== undefined) {
    formData.append("categoryIds", JSON.stringify(input.categoryIds));
  }
  if (input.sizes !== undefined) {
    formData.append("sizes", JSON.stringify(input.sizes));
  }
  if (input.colors !== undefined) {
    formData.append("colors", JSON.stringify(input.colors));
  }
  if (input.keepImageKeys !== undefined) {
    formData.append("keepImageKeys", JSON.stringify(input.keepImageKeys));
  }
  if (input.newImages && input.newImages.length > 0) {
    for (const image of input.newImages) {
      formData.append("newImages", image);
    }
  }

  const { data } = await $fetchAndThrow(`/products/${id}`, {
    method: "PUT",
    output: successResSchema(ProductExtendedSchema),
    body: formData,
  });

  return data ?? null;
};

export const deleteProduct = async (id: string) => {
  const { data } = await $fetchAndThrow(`/products/${id}`, {
    method: "DELETE",
    output: successResSchema(ProductExtendedSchema),
  });

  return data ?? null;
};

// ── Orders ──────────────────────────────────────────────────

const AdminOrdersListSchema = z.array(OrderWithCustomerSelectSchema);

export type AdminOrderRow = z.infer<typeof OrderWithCustomerSelectSchema>;

export type AdminOrdersListParams = {
  page?: number;
  limit?: number;
};

export const defaultAdminsOrdersListParams: AdminOrdersListParams = {
  page: 1,
  limit: 50,
};

export const getAdminOrders = async (queryParams: AdminOrdersListParams = {}, cookie?: string) => {
  const { data, error } = await $fetch("/admin/orders", {
    output: successResSchema(AdminOrdersListSchema),
    headers: cookie ? { cookie } : undefined,
    query: queryParams,
  });

  if (error) {
    console.error(error);
    return null;
  }

  return {
    orders: data?.data ?? [],
    total: data?.pagination?.total ?? 0,
  };
};
