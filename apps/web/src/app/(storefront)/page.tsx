import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Discover premium quality and exceptional design. Ahia brings a curated shopping experience right to your fingertips.",
};

import { cacheLife } from "next/cache";

import { FeaturedCategories } from "@/components/storefront/featured-categories";
import { FeaturedProducts } from "@/components/storefront/featured-products";
import { HeroFeaturedProduct } from "@/components/storefront/hero-featured-product";
import { TrendingProducts } from "@/components/storefront/trending-products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Home = () => {
  return (
    <div className="flex w-full flex-col">
      {/* Hero */}
      <section className="container mb-8 flex w-full flex-col items-center justify-between gap-12 px-4 py-12 md:py-20 lg:flex-row lg:gap-16">
        <div className="z-10 flex flex-col items-start gap-6 text-left lg:w-1/2">
          <CollectionBadge />
          <h1 className="font-heading text-4xl leading-[1.08]! font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Curated essentials,
            <br />
            <span className="text-muted-foreground/60">beautifully minimal.</span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            Discover premium quality and exceptional design built to last. A shopping experience
            that feels as good as what you buy.
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              className="h-12 rounded-full px-8 text-sm font-semibold shadow-lg shadow-primary/10"
              render={<Link href="/shop" />}
            >
              Shop Collection
            </Button>
            <Button
              size="lg"
              variant="ghost"
              nativeButton={false}
              className="group h-12 rounded-full px-6 text-sm font-medium text-muted-foreground hover:text-foreground"
              render={<Link href="/shop?new=true" />}
            >
              What&apos;s New
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5"
              />
            </Button>
          </div>
        </div>

        <HeroFeaturedProduct />
      </section>

      <FeaturedCategories />
      <TrendingProducts />
      <FeaturedProducts />
    </div>
  );
};

export default Home;

const CollectionBadge = async () => {
  "use cache";
  cacheLife("hours");

  return (
    <Badge
      variant="outline"
      className="rounded-full border-primary/20 bg-primary/5 text-xs font-semibold tracking-wide text-primary uppercase"
    >
      SS{new Date().getFullYear().toString().slice(-2)} Collection
    </Badge>
  );
};
