import { z } from "zod";

import { $fetch } from "@/lib/fetch";
import { successResSchema } from "@/lib/schemas";

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
