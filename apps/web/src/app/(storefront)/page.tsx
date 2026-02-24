import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Discover premium quality and exceptional design. Ahia brings a curated shopping experience right to your fingertips.",
};

import { FeaturedCategories } from "@/components/storefront/featured-categories";
import { FeaturedProducts } from "@/components/storefront/featured-products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="mx-auto flex w-full max-w-300 flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 py-12 md:py-20 px-4 mb-8">
        <div className="flex flex-col items-start text-left lg:w-1/2 gap-6 z-10">
          <Badge
            variant="outline"
            className="rounded-full px-3.5 py-1 text-xs font-semibold border-primary/20 bg-primary/5 text-primary tracking-wide uppercase"
          >
            SS26 Collection
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-foreground leading-[1.08]!">
            Curated essentials,
            <br />
            <span className="text-muted-foreground/60">beautifully minimal.</span>
          </h1>
          <p className="max-w-md text-base md:text-lg text-muted-foreground leading-relaxed">
            Discover premium quality and exceptional design built to last. A shopping experience
            that feels as good as what you buy.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <Button
              size="lg"
              nativeButton={false}
              className="rounded-full px-8 h-12 text-sm font-semibold shadow-lg shadow-primary/10"
              render={<Link href="/categories" />}
            >
              Shop Collection
            </Button>
            <Button
              size="lg"
              variant="ghost"
              nativeButton={false}
              className="rounded-full px-6 h-12 text-sm font-medium group text-muted-foreground hover:text-foreground"
              render={<Link href="/categories?c=new" />}
            >
              What&apos;s New
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                className="ml-1.5 size-4 group-hover:translate-x-0.5 transition-transform"
              />
            </Button>
          </div>
        </div>

        <div className="w-full lg:w-1/2 relative mt-4 lg:mt-0">
          <div className="aspect-square sm:aspect-video lg:aspect-4/3 rounded-3xl overflow-hidden bg-muted/50 relative group">
            <div className="absolute inset-0 bg-linear-to-tr from-muted/60 via-transparent to-background/10 group-hover:scale-105 transition-transform duration-1000 ease-out" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-muted-foreground/30 font-semibold tracking-[0.2em] uppercase text-xs">
                Featured Product
              </span>
            </div>
          </div>
        </div>
      </section>

      <FeaturedCategories />
      <FeaturedProducts />
    </div>
  );
}
