import { validator } from "hono-openapi";
import slugify from "slugify";
import { z } from "zod";

import { createRouter } from "@/app";
import HttpStatusCodes from "@/lib/http-status-codes";
import { errorResponse, successResponse } from "@/lib/utils";
import { authed } from "@/middleware/authed";
import checkRole from "@/middleware/check-role";
import { validationHook } from "@/middleware/validation-hook";
import { getCategoryById } from "@/queries/category-queries";
import { db, eq } from "@repo/db";
import { category } from "@repo/db/schemas/product.schema";
import { CreateCategorySchema, UpdateCategorySchema } from "@repo/db/validators/product.validator";

import {
  createCategoryDoc,
  deleteCategoryDoc,
  getAllCategoriesDoc,
  getCategoryDoc,
  updateCategoryDoc,
} from "./categories.docs";

const categories = createRouter();

// Get all categories
categories.get("/", getAllCategoriesDoc, async (c) => {
  try {
    const allCategories = await db.query.category.findMany();

    return c.json(
      successResponse(allCategories, "All categories retrieved successfully"),
      HttpStatusCodes.OK,
    );
  } catch (error) {
    console.error("Error retrieving categories:", error);
    return c.json(
      errorResponse("INTERNAL_SERVER_ERROR", "Failed to retrieve categories"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
});

// Get category by ID
categories.get(
  "/:id",
  getCategoryDoc,
  validator("param", z.object({ id: z.uuid() }), validationHook),
  async (c) => {
    const { id } = c.req.valid("param");

    try {
      const categoryWithProducts = await getCategoryById(id);

      if (!categoryWithProducts) {
        return c.json(errorResponse("NOT_FOUND", "Category not found"), HttpStatusCodes.NOT_FOUND);
      }

      return c.json(
        successResponse(categoryWithProducts, "Category retrieved successfully"),
        HttpStatusCodes.OK,
      );
    } catch (error) {
      console.error("Error retrieving category:", error);
      return c.json(
        errorResponse("INTERNAL_SERVER_ERROR", "Failed to retrieve category"),
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

// Middleware for protected routes
categories.use(authed).use(checkRole(["admin", "superadmin"]));

// Create category
categories.post(
  "/",
  createCategoryDoc,
  validator("json", CreateCategorySchema, validationHook),
  async (c) => {
    const categoryData = c.req.valid("json");

    const trimmedName = categoryData.name.trim();

    try {
      const result = await db.transaction(async (tx) => {
        // Check for existing name (case-insensitive)
        const existingCategory = await tx.query.category.findFirst({
          where: (category, { sql }) => sql`LOWER(${category.name}) = LOWER(${trimmedName})`,
        });

        if (existingCategory) {
          throw new Error("CATEGORY_EXISTS");
        }

        // Generate unique slug
        const allCategories = await tx.query.category.findMany({
          columns: { slug: true },
        });

        let slug = slugify(trimmedName, { lower: true, strict: true });
        let counter = 0;

        while (true) {
          const finalSlug = counter === 0 ? slug : `${slug}-${counter}`;
          const existingSlug = allCategories.find((cat) => cat.slug === finalSlug);

          if (!existingSlug) {
            slug = finalSlug;
            break;
          }
          counter++;
        }

        const [newCategory] = await tx
          .insert(category)
          .values({ name: trimmedName, slug })
          .returning();

        return newCategory;
      });

      return c.json(
        successResponse(result, "Category created successfully"),
        HttpStatusCodes.CREATED,
      );
    } catch (error) {
      if (error instanceof Error && error.message === "CATEGORY_EXISTS") {
        return c.json(
          errorResponse("CONFLICT", "Category name already exists"),
          HttpStatusCodes.CONFLICT,
        );
      }

      console.error("Error creating category:", error);
      return c.json(
        errorResponse("INTERNAL_SERVER_ERROR", "Failed to create category"),
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

// Update category
categories.put(
  "/:id",
  updateCategoryDoc,
  validator("param", z.object({ id: z.uuid() }), validationHook),
  validator("json", UpdateCategorySchema, validationHook),
  async (c) => {
    const { id } = c.req.valid("param");
    const categoryData = c.req.valid("json");

    try {
      const trimmedName = categoryData.name?.trim();

      const categoryToUpdate = await getCategoryById(id);

      if (!categoryToUpdate) {
        return c.json(errorResponse("NOT_FOUND", "Category not found"), HttpStatusCodes.NOT_FOUND);
      }

      if (!trimmedName || trimmedName.toLowerCase() === categoryToUpdate.name.toLowerCase()) {
        return c.json(
          successResponse(categoryToUpdate, "Category updated successfully"),
          HttpStatusCodes.OK,
        );
      }

      try {
        const result = await db.transaction(async (tx) => {
          // Fetch all categories except current one
          const allCategories = await tx.query.category.findMany({
            where: (category, { ne }) => ne(category.id, id),
            columns: { id: true, name: true },
          });

          // Check for case-insensitive name match
          const existingCategory = allCategories.find(
            (cat) => cat.name.toLowerCase() === trimmedName.toLowerCase(),
          );

          if (existingCategory) {
            throw new Error("CATEGORY_EXISTS");
          }

          // Generate unique slug
          const allCategoriesForSlug = await tx.query.category.findMany({
            columns: { slug: true, id: true },
          });

          let slug = slugify(trimmedName, { lower: true, strict: true });
          let counter = 0;

          while (true) {
            const finalSlug = counter === 0 ? slug : `${slug}-${counter}`;
            const existingSlug = allCategoriesForSlug.find(
              (cat) => cat.slug === finalSlug && cat.id !== id,
            );

            if (!existingSlug) {
              slug = finalSlug;
              break;
            }
            counter++;
          }

          const [updatedCategory] = await tx
            .update(category)
            .set({ name: trimmedName, slug })
            .where(eq(category.id, id))
            .returning();

          return updatedCategory;
        });

        return c.json(successResponse(result, "Category updated successfully"), HttpStatusCodes.OK);
      } catch (error) {
        if (error instanceof Error && error.message === "CATEGORY_EXISTS") {
          return c.json(
            errorResponse("CONFLICT", "Category name already exists"),
            HttpStatusCodes.CONFLICT,
          );
        }
        throw error;
      }
    } catch (error) {
      console.error("Error updating category:", error);
      return c.json(
        errorResponse("INTERNAL_SERVER_ERROR", "Failed to update category"),
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

// Delete category
categories.delete(
  "/:id",
  deleteCategoryDoc,
  validator("param", z.object({ id: z.uuid() }), validationHook),
  async (c) => {
    const { id } = c.req.valid("param");

    try {
      const result = await db.transaction(async (tx) => {
        const categoryToDelete = await tx.query.category.findFirst({
          where: (category, { eq }) => eq(category.id, id),
          with: {
            productCategories: {
              columns: { id: true },
            },
          },
        });

        if (!categoryToDelete) {
          throw new Error("CATEGORY_NOT_FOUND");
        }

        if (categoryToDelete.productCategories.length > 0) {
          throw new Error("CATEGORY_HAS_PRODUCTS");
        }

        const [deletedCategory] = await tx.delete(category).where(eq(category.id, id)).returning();

        return deletedCategory;
      });

      return c.json(successResponse(result, "Category deleted successfully"), HttpStatusCodes.OK);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "CATEGORY_NOT_FOUND") {
          return c.json(
            errorResponse("NOT_FOUND", "Category not found"),
            HttpStatusCodes.NOT_FOUND,
          );
        }

        if (error.message === "CATEGORY_HAS_PRODUCTS") {
          return c.json(
            errorResponse("CONFLICT", "Category has associated products"),
            HttpStatusCodes.CONFLICT,
          );
        }
      }

      console.error("Error deleting category:", error);
      return c.json(
        errorResponse("INTERNAL_SERVER_ERROR", "Failed to delete category"),
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

export default categories;
