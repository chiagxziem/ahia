export const queryKeys = {
  user: () => ["user"] as const,
  cart: () => ["cart"] as const,
  product: (id: string) => ["product", id] as const,
  relatedProducts: (id: string) => ["related-products", id] as const,
  featuredProduct: () => ["featured-product"] as const,
  latestProducts: () => ["latest-products"] as const,
  topCategories: () => ["top-categories"] as const,
  trendingProducts: () => ["trending-products"] as const,
  shopProducts: (
    params: Record<string, string | number | boolean | undefined> = {},
  ) => ["shop-products", params] as const,
  searchProducts: (query: string) => ["search-products", query] as const,
  allCategories: () => ["all-categories"] as const,
  adminStats: () => ["admin", "stats"] as const,
  adminUsers: (
    params: Record<string, string | number | boolean | undefined> = {},
  ) => ["admin", "users", params] as const,
  adminCategories: (
    params: Record<string, string | number | boolean | undefined> = {},
  ) => ["admin", "categories", params] as const,
  adminProducts: (
    params: Record<string, string | number | boolean | undefined> = {},
  ) => ["admin", "products", params] as const,
  adminOrders: (
    params: Record<string, string | number | boolean | undefined> = {},
  ) => ["admin", "orders", params] as const,
};
