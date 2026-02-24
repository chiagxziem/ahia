import type { Metadata } from "next";

import { CategorySidebar, MobileFilterDrawer } from "@/components/storefront/category-sidebar";
import { ProductCard } from "@/components/storefront/product-card";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse our full collection of curated essentials across all categories.",
};

// Dummy data for visual design, representing a full category listing
const CATEGORY_PRODUCTS = [
  {
    id: "1",
    name: "Minimalist Watch",
    price: "$120",
    category: "Accessories",
    slug: "minimalist-watch",
    tag: "Bestseller",
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
  {
    id: "5",
    name: "Studio Headphones",
    price: "$250",
    category: "Tech",
    slug: "studio-headphones",
    tag: "Sale",
  },
  { id: "6", name: "Cotton Beanie", price: "$25", category: "Apparel", slug: "cotton-beanie" },
  {
    id: "7",
    name: "Everyday Backpack",
    price: "$95",
    category: "Accessories",
    slug: "everyday-backpack",
  },
  { id: "8", name: "Ceramic Mug", price: "$18", category: "Home", slug: "ceramic-mug" },
  { id: "9", name: "Desk Mat", price: "$40", category: "Accessories", slug: "desk-mat" },
];

export default function CategoriesPage() {
  return (
    <div className="w-full max-w-300 mx-auto md:px-8 flex flex-col lg:flex-row">
      {/* Sidebar for Desktop */}
      <CategorySidebar />

      {/* Main Content Area */}
      <div className="flex-1 px-4 py-8 lg:py-12">
        <div className="flex flex-col gap-8">
          {/* Page Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">All Products</h1>
                <MobileFilterDrawer />
              </div>
              <span className="text-xs md:text-sm text-muted-foreground">
                {CATEGORY_PRODUCTS.length} products
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Browse our full collection of curated essentials.
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {CATEGORY_PRODUCTS.map((product) => (
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
      </div>
    </div>
  );
}
