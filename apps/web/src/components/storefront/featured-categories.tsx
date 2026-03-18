"use client";

import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { getTopCategories } from "@/features/storefront/queries";
import { queryKeys } from "@/lib/query-keys";

export const FeaturedCategories = () => {
  const { data: categories } = useQuery({
    queryKey: queryKeys.topCategories(),
    queryFn: () => getTopCategories(),
  });

  if (!categories || categories.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-300 px-4 py-16">
      <div className="flex flex-col gap-10">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
              Shop by Category
            </h2>
            <p className="text-muted-foreground">Find exactly what you&apos;re looking for.</p>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-1 text-sm font-medium transition-colors hover:text-primary sm:flex"
          >
            View all <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/shop?cat=${category.slug}`} className="group relative">
              <div className="flex h-full flex-col gap-3 rounded-2xl bg-muted/40 p-5 transition-all duration-300 hover:bg-muted/60 md:p-6">
                <div className="size-10 rounded-xl bg-muted-foreground/6 transition-colors group-hover:bg-muted-foreground/10" />

                <div className="flex flex-col gap-1">
                  <div className="mt-auto flex flex-col gap-1">
                    <span className="text-base font-semibold tracking-tight transition-colors group-hover:text-primary md:text-lg">
                      {category.name}
                    </span>
                  </div>

                  <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                    {category.productCount} {category.productCount === 1 ? "Item" : "Items"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
