import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
