"use client";

import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { ProductCard } from "@/components/storefront/product-card";
import { getTrendingProducts } from "@/features/storefront/queries";
import { queryKeys } from "@/lib/query-keys";

export const TrendingProducts = () => {
  const { data: products } = useQuery({
    queryKey: queryKeys.trendingProducts(),
    queryFn: () => getTrendingProducts(),
  });

  if (!products || products.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-300 px-4 py-16">
      <div className="flex flex-col gap-10">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
              Trending Now
            </h2>
            <p className="text-muted-foreground">
              Our most popular picks right now.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-1 text-sm font-medium transition-colors hover:text-primary sm:flex"
          >
            Shop all{" "}
            <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              category={product.categories?.[0]?.name ?? ""}
              slug={product.slug}
              imageUrl={product.images?.[0]?.url}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
