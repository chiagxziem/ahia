import { z } from "zod";

import { $fetch, $fetchAndThrow } from "@/lib/fetch";
import { successResSchema } from "@/lib/schemas";
import { UserSelectSchema } from "@repo/db/validators/user.validator";

const windowNumberSchema = z.object({
  "24h": z.number(),
  "7d": z.number(),
  "1m": z.number(),
});

const adminStatsSchema = z.object({
  revenue: z.object({
    value: windowNumberSchema,
    changePct: windowNumberSchema,
  }),
  orders: z.object({
    value: windowNumberSchema,
    changePct: windowNumberSchema,
  }),
  products: z.object({
    value: z.object({
      total: z.number(),
    }),
    changePct: windowNumberSchema,
  }),
  users: z.object({
    value: z.object({
      total: z.number(),
    }),
    change: windowNumberSchema,
  }),
});

export type AdminStats = z.infer<typeof adminStatsSchema>;

const adminUsersListParamsSchema = z.object({
  searchValue: z.string().optional(),
  searchField: z.enum(["email", "name"]).optional(),
  searchOperator: z.enum(["contains", "starts_with", "ends_with"]).optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  filterField: z.string().optional(),
  filterValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  filterOperator: z.enum(["eq", "ne", "lt", "lte", "gt", "gte", "contains"]).optional(),
});

const adminUsersListSchema = z.object({
  users: z.array(UserSelectSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
});

export type AdminUsersListParams = z.infer<typeof adminUsersListParamsSchema>;
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
  const validatedQueryParams = adminUsersListParamsSchema.parse(queryParams);

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
