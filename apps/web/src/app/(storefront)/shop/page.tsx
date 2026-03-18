"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo } from "react";

import { ProductCard } from "@/components/storefront/product-card";
import { MobileFilterDrawer, ShopSidebar } from "@/components/storefront/shop-sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getShopProducts, getTrendingProducts } from "@/features/storefront/queries";
import { queryKeys } from "@/lib/query-keys";

const sortOptions = ["newest", "price-asc", "price-desc"] as const;

export const useShopFilters = () => {
  const [cat, setCat] = useQueryState("cat", parseAsString);
  const [isNew, setIsNew] = useQueryState("new", parseAsString);
  const [sort, setSort] = useQueryState("sort", parseAsStringLiteral(sortOptions));
  const [minPrice, setMinPrice] = useQueryState("minPrice", parseAsInteger);
  const [maxPrice, setMaxPrice] = useQueryState("maxPrice", parseAsInteger);
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const clearAll = () => {
    void setCat(null);
    void setIsNew(null);
    void setSort(null);
    void setMinPrice(null);
    void setMaxPrice(null);
    void setPage(null);
  };

  const hasActiveFilters = !!(cat || isNew || sort || minPrice || maxPrice);

  return {
    cat,
    setCat,
    isNew: isNew === "true",
    setIsNew,
    sort,
    setSort,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    page,
    setPage,
    clearAll,
    hasActiveFilters,
  };
};

const ShopPage = () => {
  const filters = useShopFilters();

  const params = useMemo(
    () => ({
      page: filters.page,
      cat: filters.cat ?? undefined,
      new: filters.isNew || undefined,
      sort: filters.sort ?? undefined,
      minPrice: filters.minPrice ?? undefined,
      maxPrice: filters.maxPrice ?? undefined,
    }),
    [filters.page, filters.cat, filters.isNew, filters.sort, filters.minPrice, filters.maxPrice],
  );

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.shopProducts(params),
    queryFn: () => getShopProducts(params),
  });

  const { data: trendingProducts } = useQuery({
    queryKey: queryKeys.trendingProducts(),
    queryFn: () => getTrendingProducts(),
  });

  const trendingIds = useMemo(
    () => new Set(trendingProducts?.map((p) => p.id) ?? []),
    [trendingProducts],
  );

  const products = data?.products ?? [];
  const pagination = data?.pagination;

  return (
    <div className="mx-auto flex w-full max-w-300 flex-col md:px-8 lg:flex-row">
      {/* Sidebar for Desktop */}
      <ShopSidebar filters={filters} />

      {/* Main Content Area */}
      <div className="flex-1 px-4 py-8 lg:py-12">
        <div className="flex flex-col gap-8">
          {/* Page Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
                  {filters.cat ? "Shop" : "All Products"}
                </h1>
                <MobileFilterDrawer filters={filters} />
              </div>
              <span className="text-xs text-muted-foreground md:text-sm">
                {isLoading ? "…" : `${pagination?.total ?? products.length} products`}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Browse our full collection of curated essentials.
            </p>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="aspect-3/4 w-full rounded-xl md:rounded-2xl" />
                  <div className="flex items-start justify-between gap-3 px-0.5">
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-2.5 w-16" />
                    </div>
                    <Skeleton className="h-3.5 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-3">
              {products.map((product) => {
                const isNew =
                  Date.now() - new Date(product.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;
                const isTrending = trendingIds.has(product.id);
                const tag = isTrending ? "Trending" : isNew ? "New" : undefined;

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    category={product.categories?.[0]?.name ?? ""}
                    slug={product.slug}
                    imageUrl={product.images?.[0]?.url}
                    tag={tag}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <p className="text-muted-foreground">No products found.</p>
              {filters.hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={filters.clearAll}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={filters.page <= 1}
                onClick={() => void filters.setPage(filters.page - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">
                Page {filters.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={filters.page >= pagination.totalPages}
                onClick={() => void filters.setPage(filters.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
