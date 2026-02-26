"use client";

import { ArrowRight02Icon, ShoppingCart01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import * as React from "react";

import { ProductCard } from "@/components/storefront/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Dummy product data matching the schema
const PRODUCT = {
  id: "1",
  name: "Minimalist Watch",
  slug: "minimalist-watch",
  description:
    "A beautifully crafted minimalist watch designed for everyday elegance. Featuring a clean dial with subtle hour markers, a genuine leather strap, and Japanese quartz movement. Water-resistant up to 30 meters. The perfect balance of form and function.",
  price: "120.00",
  stockQuantity: 15,
  sizes: [
    { name: "38mm", inStock: true },
    { name: "40mm", inStock: true },
    { name: "42mm", inStock: false },
  ],
  colors: [
    { name: "Silver", inStock: true },
    { name: "Rose Gold", inStock: true },
    { name: "Matte Black", inStock: true },
    { name: "Champagne", inStock: false },
  ],
  images: [
    { url: "", key: "1" },
    { url: "", key: "2" },
    { url: "", key: "3" },
  ],
  categories: [{ name: "Accessories", slug: "accessories" }],
};

// Dummy related products
const RELATED_PRODUCTS = [
  {
    id: "4",
    name: "Leather Wallet",
    price: "$60",
    category: "Accessories",
    slug: "leather-wallet",
  },
  {
    id: "7",
    name: "Everyday Backpack",
    price: "$95",
    category: "Accessories",
    slug: "everyday-backpack",
  },
  { id: "9", name: "Desk Mat", price: "$40", category: "Accessories", slug: "desk-mat" },
  {
    id: "5",
    name: "Studio Headphones",
    price: "$250",
    category: "Accessories",
    slug: "studio-headphones",
  },
];

export default function ProductDetailPage() {
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);

  const product = PRODUCT;

  return (
    <div className="container w-full px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href="/categories" className="transition-colors hover:text-foreground">
          {product.categories[0]?.name ?? "Shop"}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Product Section */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/30 md:rounded-[28px]">
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-sm font-semibold tracking-[0.15em] text-muted-foreground/30 uppercase">
                Product Photo
              </span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((image, index) => (
                <button
                  key={image.key}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square w-20 overflow-hidden rounded-xl bg-muted/30 transition-all ${
                    selectedImageIndex === index
                      ? "ring-2 ring-primary ring-offset-2"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="size-6 rounded-full bg-muted-foreground/5" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6 lg:pt-2">
          {/* Category & Tags */}
          <div className="flex items-center gap-3">
            {product.categories.map((cat) => (
              <Link key={cat.slug} href={`/categories?cat=${cat.slug}`}>
                <Badge
                  variant="outline"
                  className="rounded-full border-border/60 px-3 py-1 text-xs font-semibold tracking-widest uppercase transition-colors hover:bg-muted"
                >
                  {cat.name}
                </Badge>
              </Link>
            ))}
            {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
              <Badge className="rounded-full border-0 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 hover:bg-amber-500/10">
                Only {product.stockQuantity} left
              </Badge>
            )}
          </div>

          {/* Name & Price */}
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {product.name}
            </h1>
            <span className="text-2xl font-semibold text-foreground">${product.price}</span>
          </div>

          {/* Description */}
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {/* Divider */}
          <div className="h-px bg-border/40" />

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                Color{selectedColor && ` — ${selectedColor}`}
              </span>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    disabled={!color.inStock}
                    onClick={() => setSelectedColor(color.name)}
                    className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
                      selectedColor === color.name
                        ? "border-foreground bg-foreground text-background"
                        : color.inStock
                          ? "border-border/60 text-foreground hover:border-foreground/40"
                          : "cursor-not-allowed border-border/30 text-muted-foreground/40 line-through"
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                Size{selectedSize && ` — ${selectedSize}`}
              </span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    disabled={!size.inStock}
                    onClick={() => setSelectedSize(size.name)}
                    className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
                      selectedSize === size.name
                        ? "border-foreground bg-foreground text-background"
                        : size.inStock
                          ? "border-border/60 text-foreground hover:border-foreground/40"
                          : "cursor-not-allowed border-border/30 text-muted-foreground/40 line-through"
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="mt-2 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4 rounded-full bg-muted/40 px-4 py-2 text-sm font-medium">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  −
                </button>
                <span className="min-w-6 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <Button
                size="lg"
                className="h-12 flex-1 gap-2 rounded-full text-base font-semibold shadow-lg shadow-primary/10"
                disabled={product.stockQuantity === 0}
              >
                <HugeiconsIcon icon={ShoppingCart01Icon} className="size-5" />
                {product.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>
          </div>

          {/* Stock info */}
          {product.stockQuantity > 0 && (
            <p className="text-sm text-muted-foreground">
              {product.stockQuantity} in stock · Free shipping on orders over $100
            </p>
          )}
        </div>
      </div>

      {/* Related Products */}
      <section className="mt-24 mb-16">
        <div className="flex flex-col gap-8">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">You might also like</h2>
              <p className="text-muted-foreground">
                More from {product.categories[0]?.name ?? "this collection"}
              </p>
            </div>
            <Link
              href="/categories"
              className="hidden items-center gap-1 text-sm font-medium transition-colors hover:text-primary sm:flex"
            >
              View all <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {RELATED_PRODUCTS.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                name={relatedProduct.name}
                price={relatedProduct.price}
                category={relatedProduct.category}
                slug={relatedProduct.slug}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
