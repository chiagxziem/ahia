import { z } from "zod";

export const successResSchema = <T>(data: z.ZodType<T>) =>
  z.object({
    status: z.literal("success"),
    details: z.string(),
    data: data,
  });

export const errorResSchema = z.object({
  status: z.literal("error"),
  error: z.object({
    code: z.string(),
    details: z.string(),
    fields: z.record(z.string(), z.string()),
  }),
});
