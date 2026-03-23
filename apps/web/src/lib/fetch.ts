import { createFetch } from "@better-fetch/fetch";

import { errorResSchema } from "@/lib/schemas";

import env from "./env";

// When using the baseURL on the server, the full URL is used to avoid CORS issues. On the client, a relative URL is used
const baseURL = typeof window === "undefined" ? `${env.API_URL}/api` : "/api";

export const $fetch = createFetch({
  baseURL,
  credentials: "include",
  errorSchema: errorResSchema,
});

export const $fetchAndThrow = createFetch({
  baseURL,
  throw: true,
  credentials: "include",
  errorSchema: errorResSchema,
});

export const $fetchAndRetry = createFetch({
  baseURL,
  retry: {
    type: "linear",
    attempts: 2,
    delay: 500,
  },
  credentials: "include",
  errorSchema: errorResSchema,
});
