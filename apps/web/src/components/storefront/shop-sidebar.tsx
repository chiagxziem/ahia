"use client";

import { Cancel01Icon, FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";

import type { useShopFilters } from "@/app/(storefront)/shop/page";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { getAllCategories } from "@/features/storefront/queries";
import { queryKeys } from "@/lib/query-keys";

type ShopFilters = ReturnType<typeof useShopFilters>;

const PRICE_RANGES = [
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 – $100", min: 50, max: 100 },
  { label: "$100 – $200", min: 100, max: 200 },
  { label: "$200+", min: 200, max: undefined },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

const FilterContent = ({ filters }: { filters: ShopFilters }) => {
  const { data: categories } = useQuery({
    queryKey: queryKeys.allCategories(),
    queryFn: () => getAllCategories(),
  });

  return (
    <div className="flex flex-col gap-7">
      {/* Categories */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Category
        </span>
        <div className="flex flex-col gap-2.5">
          {categories?.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2.5">
              <Checkbox
                id={`filter-cat-${cat.slug}`}
                className="size-4 rounded"
                checked={filters.cat === cat.slug}
                onCheckedChange={(checked) => {
                  void filters.setCat(checked ? cat.slug : null);
                  void filters.setPage(1);
                }}
              />
              <label
                htmlFor={`filter-cat-${cat.slug}`}
                className="cursor-pointer text-sm text-muted-foreground transition-colors select-none hover:text-foreground"
              >
                {cat.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* New Arrivals */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Arrivals
        </span>
        <div className="flex items-center gap-2.5">
          <Checkbox
            id="filter-new"
            className="size-4 rounded"
            checked={filters.isNew}
            onCheckedChange={(checked) => {
              void filters.setIsNew(checked ? "true" : null);
              void filters.setPage(1);
            }}
          />
          <label
            htmlFor="filter-new"
            className="cursor-pointer text-sm text-muted-foreground transition-colors select-none hover:text-foreground"
          >
            New Arrivals
          </label>
        </div>
      </div>

      {/* Price Ranges */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Price
        </span>
        <div className="flex flex-col gap-2.5">
          {PRICE_RANGES.map((range) => {
            const isActive =
              filters.minPrice === range.min &&
              (range.max ? filters.maxPrice === range.max : filters.maxPrice === null);

            return (
              <div key={range.label} className="flex items-center gap-2.5">
                <Checkbox
                  id={`filter-price-${range.label}`}
                  className="size-4 rounded"
                  checked={isActive}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      void filters.setMinPrice(range.min);
                      void filters.setMaxPrice(range.max ?? null);
                    } else {
                      void filters.setMinPrice(null);
                      void filters.setMaxPrice(null);
                    }
                    void filters.setPage(1);
                  }}
                />
                <label
                  htmlFor={`filter-price-${range.label}`}
                  className="cursor-pointer text-sm text-muted-foreground transition-colors select-none hover:text-foreground"
                >
                  {range.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sort */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Sort by
        </span>
        <div className="flex flex-col gap-2.5">
          {SORT_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center gap-2.5">
              <Checkbox
                id={`filter-sort-${option.value}`}
                className="size-4 rounded"
                checked={filters.sort === option.value}
                onCheckedChange={(checked) => {
                  void filters.setSort(checked ? option.value : null);
                }}
              />
              <label
                htmlFor={`filter-sort-${option.value}`}
                className="cursor-pointer text-sm text-muted-foreground transition-colors select-none hover:text-foreground"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Desktop sidebar
export const ShopSidebar = ({ filters }: { filters: ShopFilters }) => {
  return (
    <aside className="hidden w-56 shrink-0 py-12 pr-8 lg:block">
      <div className="sticky top-24">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight">Filters</span>
          {filters.hasActiveFilters && (
            <button
              onClick={filters.clearAll}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear all
            </button>
          )}
        </div>
        <FilterContent filters={filters} />
      </div>
    </aside>
  );
};

// Mobile filter drawer
export const MobileFilterDrawer = ({ filters }: { filters: ShopFilters }) => {
  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-full text-xs font-medium lg:hidden"
        >
          <HugeiconsIcon icon={FilterIcon} className="size-3.5" />
          Filters
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-[85vw] rounded-none border-r-0 sm:w-80">
        <DrawerHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/30 px-5 py-4">
          <DrawerTitle className="text-base font-semibold tracking-tight">Filters</DrawerTitle>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <FilterContent filters={filters} />
        </div>
        <div className="flex gap-3 border-t border-border/30 px-5 py-4">
          <Button
            variant="outline"
            className="flex-1 rounded-full text-xs font-medium"
            onClick={filters.clearAll}
          >
            Clear all
          </Button>
          <DrawerClose asChild>
            <Button className="flex-1 rounded-full text-xs font-medium">Apply</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
