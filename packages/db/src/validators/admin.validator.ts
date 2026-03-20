import { z } from "zod";

export const ListUsersQuerySchema = z.object({
  searchValue: z.string().optional(),
  searchField: z.enum(["email", "name"]).optional(),
  searchOperator: z.enum(["contains", "starts_with", "ends_with"]).optional(),
  limit: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  filterField: z.string().optional(),
  filterValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  filterOperator: z
    .enum(["eq", "ne", "lt", "lte", "gt", "gte", "contains"])
    .optional(),
});

export const WindowNumberSchema = z.object({
  "24h": z.number(),
  "7d": z.number(),
  "1m": z.number(),
});
