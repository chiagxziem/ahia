import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { category, product } from "../schemas/product.schema";
import { UserSelectSchema } from "./user.validator";

export const CategorySelectSchema = createSelectSchema(category).extend({
  createdAt: z.number().transform((n) => new Date(n)),
  updatedAt: z.number().transform((n) => new Date(n)),
});

export const ProductSelectSchema = createSelectSchema(product).extend({
  createdAt: z.number().transform((n) => new Date(n)),
  updatedAt: z.number().transform((n) => new Date(n)),
});

export const CategoryExtendedSchema = CategorySelectSchema.extend({
  products: ProductSelectSchema.array(),
});

export const ProductExtendedSchema = ProductSelectSchema.extend({
  categories: CategorySelectSchema.array(),
  creator: UserSelectSchema.optional(),
});

export const CreateCategorySchema = createInsertSchema(category, {
  name: (n) => n.min(1),
}).pick({
  name: true,
});

export const UpdateCategorySchema = CreateCategorySchema;
