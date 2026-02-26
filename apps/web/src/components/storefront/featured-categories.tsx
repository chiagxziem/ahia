import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

// Dummy data for visual design
const CATEGORIES = [
  { id: "1", name: "Apparel", count: "120 Items", description: "Everyday essentials" },
  { id: "2", name: "Footwear", count: "85 Items", description: "Step out in style" },
  { id: "3", name: "Accessories", count: "340 Items", description: "The finishing touch" },
  { id: "4", name: "Tech", count: "12 Items", description: "Smart simplicity" },
];

export function FeaturedCategories() {
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
            href="/categories"
            className="hidden items-center gap-1 text-sm font-medium transition-colors hover:text-primary sm:flex"
          >
            View all <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/categories?c=${category.name.toLowerCase()}`}
              className="group relative"
            >
              <div className="flex h-full flex-col gap-3 rounded-2xl bg-muted/40 p-5 transition-all duration-300 hover:bg-muted/60 md:p-6">
                {/* Category icon placeholder */}
                <div className="size-10 rounded-xl bg-muted-foreground/6 transition-colors group-hover:bg-muted-foreground/10" />

                <div className="mt-auto flex flex-col gap-1">
                  <span className="text-base font-semibold tracking-tight transition-colors group-hover:text-primary md:text-lg">
                    {category.name}
                  </span>
                  <span className="text-xs text-muted-foreground/70">{category.description}</span>
                </div>

                <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                  {category.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
