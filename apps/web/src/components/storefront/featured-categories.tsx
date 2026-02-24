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
    <section className="w-full max-w-300 mx-auto px-4 py-16">
      <div className="flex flex-col gap-10">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Shop by Category</h2>
            <p className="text-muted-foreground">Find exactly what you&apos;re looking for.</p>
          </div>
          <Link
            href="/categories"
            className="hidden sm:flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
          >
            View all <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/categories?c=${category.name.toLowerCase()}`}
              className="group relative"
            >
              <div className="flex flex-col gap-3 p-5 md:p-6 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-all duration-300 h-full">
                {/* Category icon placeholder */}
                <div className="size-10 rounded-xl bg-muted-foreground/6 group-hover:bg-muted-foreground/10 transition-colors" />

                <div className="flex flex-col gap-1 mt-auto">
                  <span className="text-base md:text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                  <span className="text-xs text-muted-foreground/70">{category.description}</span>
                </div>

                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
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
