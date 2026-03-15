export const queryKeys = {
  user: () => ["user"] as const,
  adminStats: () => ["admin", "stats"] as const,
  adminUsers: (params: Record<string, string | number | boolean | undefined> = {}) =>
    ["admin", "users", params] as const,
  adminCategories: (params: Record<string, string | number | boolean | undefined> = {}) =>
    ["admin", "categories", params] as const,
  adminProducts: (params: Record<string, string | number | boolean | undefined> = {}) =>
    ["admin", "products", params] as const,
  adminOrders: (params: Record<string, string | number | boolean | undefined> = {}) =>
    ["admin", "orders", params] as const,
};
