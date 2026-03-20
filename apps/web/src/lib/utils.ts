import { BetterFetchError } from "@better-fetch/fetch";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { errorResSchema } from "@/lib/schemas";

/**
 * Merges class names using clsx and resolves Tailwind conflicts with twMerge.
 * @param inputs - Class values (strings, arrays, objects) accepted by clsx.
 * @returns A deduplicated, Tailwind-merged className string.
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

/**
 * Generates initials from a name.
 * @param name - The name to generate initials from.
 * @returns The initials of the name.
 */
export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Roles enum
 */
export const roles = {
  ADMIN: "admin",
  SUPERADMIN: "superadmin",
  USER: "user",
};

/**
 * Truncates an email address.
 * Displays the first 3 and last 3 characters of the local part (before @) with '...' in between.
 * @param email - The email address to truncate.
 * @returns The truncated email address.
 */
export const truncateEmail = (email: string) => {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;

  if (localPart.length <= 6) {
    return email;
  }

  const firstThree = localPart.slice(0, 3);
  const lastThree = localPart.slice(-3);
  return `${firstThree}...${lastThree}@${domain}`;
};

/**
 * Formats a number as a signed percentage string, e.g. `+3.5%` or `-1.2%`.
 * @param value - The numeric value to format.
 */
export const formatPct = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

/**
 * Formats a number as a signed integer string, e.g. `+5` or `-3`.
 * @param value - The numeric value to format.
 */
export const formatSigned = (value: number) =>
  `${value >= 0 ? "+" : ""}${value}`;

/**
 * Formats a number as a USD currency string, e.g. `$1,234.56`.
 * @param value - The numeric value to format.
 */
export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

/**
 * Truncates a long ID (e.g. UUID) for display.
 * Shows the first 8 characters, an ellipsis, and the last 4 characters.
 * @param id - The ID string to truncate.
 * @returns A shortened display string like `550e8400…0000`.
 */
export const truncateId = (id: string): string => {
  if (id.length <= 14) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
};

/**
 * Extracts a human-readable error message from any error thrown by
 * $fetchAndThrow (BetterFetchError) or a plain Error.
 * @param err - The error object to extract the message from.
 * @returns A user-friendly error message string.
 *
 * Usage in onError:
 *   onError: (err) => toast.error(getApiError(err))
 */
export const getApiError = (err: unknown): string => {
  if (err instanceof BetterFetchError) {
    const parsed = errorResSchema.safeParse(err.error);
    if (parsed.success) return parsed.data.error.details;
    return err.statusText || err.message || "Something went wrong.";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
};
