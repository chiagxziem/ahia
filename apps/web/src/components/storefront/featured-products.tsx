import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

import { ProductCard } from "@/components/storefront/product-card";

// Dummy data for visual design
const PRODUCTS = [
  {
    id: "1",
    name: "Minimalist Watch",
    price: "$120",
    category: "Accessories",
    slug: "minimalist-watch",
  },
  {
    id: "2",
    name: "Essential Tee",
    price: "$35",
    category: "Apparel",
    slug: "essential-tee",
    tag: "New",
  },
  { id: "3", name: "Canvas Sneakers", price: "$85", category: "Footwear", slug: "canvas-sneakers" },
  {
    id: "4",
    name: "Leather Wallet",
    price: "$60",
    category: "Accessories",
    slug: "leather-wallet",
  },
];

export function FeaturedProducts() {
  return (
    <section className="mx-auto mb-24 w-full max-w-300 px-4 py-16">
      <div className="flex flex-col gap-10">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">New Arrivals</h2>
            <p className="text-muted-foreground">The latest additions to our collection.</p>
          </div>
          <Link
            href="/categories"
            className="hidden items-center gap-1 text-sm font-medium transition-colors hover:text-primary sm:flex"
          >
            Shop all <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              category={product.category}
              slug={product.slug}
              tag={product.tag}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
