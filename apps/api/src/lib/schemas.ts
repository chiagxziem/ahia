import { z } from "zod";

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const ShopQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  cat: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sort: z.enum(["newest", "price-asc", "price-desc"]).optional(),
  new: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1).optional(),
  price: z
    .string()
    .min(1)
    .regex(/^\d+(\.\d{2})?$/),
  stockQuantity: z.string().min(1),
  sizes: z
    .string()
    .optional()
    .describe(
      `JSON stringified array of size objects, e.g. [{"name":"S","inStock":true}]`,
    ),
  colors: z
    .string()
    .optional()
    .describe(
      `JSON stringified array of color objects, e.g. [{"name":"Red","inStock":true}]`,
    ),
  createdBy: z.string().min(1),
  categoryIds: z
    .string()
    .min(1)
    .describe(
      `JSON stringified array of category ID strings, e.g. ["123e4567-e89b-12d3-a456-426614174000"]`,
    ),
  images: z
    // Use z.any() for file uploads to compatible with basic OpenAPI generation
    // Manual validation is performed in the route handler
    .union([z.any(), z.array(z.any())])
    .transform((val) => {
      // Ensure we always return an array
      if (val === undefined || val === null) return [];
      return Array.isArray(val) ? val : [val];
    }),
});

export const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z
    .string()
    .regex(/^\d+(\.\d{2})?$/)
    .optional(),
  stockQuantity: z.string().optional(),
  sizes: z
    .string()
    .optional()
    .describe(
      `JSON stringified array of size objects, e.g. [{"name":"S","inStock":true}]`,
    ),
  colors: z
    .string()
    .optional()
    .describe(
      `JSON stringified array of color objects, e.g. [{"name":"Red","inStock":true}]`,
    ),
  categoryIds: z
    .string()
    .optional()
    .describe(
      `JSON stringified array of category ID strings, e.g. ["123e4567-e89b-12d3-a456-426614174000"]`,
    ),
  keepImageKeys: z
    .string()
    .optional()
    .describe(`JSON array of image keys to keep`),
  newImages: z
    // Use z.any() for file uploads to compatible with basic OpenAPI generation
    .union([z.any(), z.array(z.any())])
    .transform((val) => {
      if (val === undefined || val === null) return [];
      return Array.isArray(val) ? val : [val];
    })
    .optional(),
});

export const InStockSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  inStock: z.boolean(),
});

export const SearchQuerySchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().int().positive().optional(),
});
