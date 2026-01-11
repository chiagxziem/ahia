import type z from "zod";

/**
 * Helper function to create a success response for API routes.
 * @param data - The data to include in the response.
 * @param details - Additional details about the response.
 * @returns An object representing the success response.
 */
export const successResponse = <TData, TDetails extends string>(
  data: TData,
  details: TDetails,
) => {
  return {
    status: "success" as const,
    details,
    data,
  };
};

/**
 * Helper function to create an error response for API routes.
 * @param code - The error code.
 * @param details - Additional details about the error.
 * @param fields - Optional fields to include in the error response.
 * @returns An object representing the error response.
 */
export const errorResponse = (
  code: string,
  details: string,
  fields?: Record<string, string>,
) => {
  return {
    status: "error",
    error: {
      code,
      details,
      fields: fields ?? {},
    },
  };
};

/**
 * Helper function to parse a JSON field from a string value.
 * @param value - The string value to parse.
 * @param schema - The Zod schema to validate the parsed value against.
 * @param fieldName - The name of the field being parsed.
 * @returns An object representing the success or failure of the parsing.
 */
export const parseJsonField = <T>(
  value: string | undefined,
  schema: z.ZodSchema<T>,
  fieldName: string,
): { success: true; data: T } | { success: false; error: string } => {
  if (!value) {
    return { success: true, data: [] as T };
  }

  try {
    const parsed = JSON.parse(value);
    const result = schema.safeParse(parsed);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return {
        success: false,
        error: `${firstError.path.join(".")} - ${firstError.message}`,
      };
    }

    return { success: true, data: result.data };
  } catch {
    return { success: false, error: `${fieldName} must be valid JSON` };
  }
};

/**
 * Generates a random password.
 * @param length - The length of the password.
 * @returns A random password.
 */
export const generatePassword = (length = 16) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((x) => chars[x % chars.length])
    .join("");
};
