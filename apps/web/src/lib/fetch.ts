import { createFetch } from "@better-fetch/fetch";

import { errorResSchema } from "@/lib/schemas";

import env from "./env";

const baseURL = typeof window === "undefined" ? `${env.API_URL}/api` : "/api";

export const $fetch = createFetch({
  baseURL,
  errorSchema: errorResSchema,
});

export const $fetchAndThrow = createFetch({
  baseURL,
  throw: true,
  errorSchema: errorResSchema,
});

export const $fetchAndRetry = createFetch({
  baseURL,
  retry: {
    type: "linear",
    attempts: 2,
    delay: 500,
  },
  errorSchema: errorResSchema,
});
