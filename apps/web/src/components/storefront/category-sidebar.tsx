"use client";

import { Cancel01Icon, FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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

const FILTERS = [
  {
    id: "category",
    name: "Category",
    options: [
      { value: "apparel", label: "Apparel" },
      { value: "footwear", label: "Footwear" },
      { value: "accessories", label: "Accessories" },
      { value: "tech", label: "Tech" },
      { value: "home", label: "Home" },
    ],
  },
  {
    id: "price",
    name: "Price",
    options: [
      { value: "0-50", label: "Under $50" },
      { value: "50-100", label: "$50 – $100" },
      { value: "100-200", label: "$100 – $200" },
      { value: "200+", label: "$200+" },
    ],
  },
  {
    id: "sort",
    name: "Sort by",
    options: [
      { value: "newest", label: "Newest" },
      { value: "price-asc", label: "Price: Low to High" },
      { value: "price-desc", label: "Price: High to Low" },
      { value: "popular", label: "Most Popular" },
    ],
  },
];

function FilterContent() {
  return (
    <div className="flex flex-col gap-7">
      {FILTERS.map((section) => (
        <div key={section.id} className="flex flex-col gap-3">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {section.name}
          </span>
          <div className="flex flex-col gap-2.5">
            {section.options.map((option) => (
              <div key={option.value} className="flex items-center gap-2.5">
                <Checkbox id={`filter-${section.id}-${option.value}`} className="size-4 rounded" />
                <label
                  htmlFor={`filter-${section.id}-${option.value}`}
                  className="cursor-pointer text-sm text-muted-foreground transition-colors select-none hover:text-foreground"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Desktop sidebar
export function CategorySidebar() {
  return (
    <aside className="hidden w-56 shrink-0 py-12 pr-8 lg:block">
      <div className="sticky top-24">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight">Filters</span>
          <button className="text-xs text-muted-foreground transition-colors hover:text-foreground">
            Clear all
          </button>
        </div>
        <FilterContent />
      </div>
    </aside>
  );
}

// Mobile filter drawer
export function MobileFilterDrawer() {
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
          <FilterContent />
        </div>
        <div className="flex gap-3 border-t border-border/30 px-5 py-4">
          <Button variant="outline" className="flex-1 rounded-full text-xs font-medium">
            Clear all
          </Button>
          <DrawerClose asChild>
            <Button className="flex-1 rounded-full text-xs font-medium">Apply</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
