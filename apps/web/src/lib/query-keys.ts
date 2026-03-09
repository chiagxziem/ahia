export const queryKeys = {
  user: () => ["user"] as const,
  adminStats: () => ["admin", "stats"] as const,
  adminUsers: (params: Record<string, string | number | boolean | undefined> = {}) =>
    ["admin", "users", params] as const,
};
