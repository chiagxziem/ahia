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
    <div className="w-full max-w-300 mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-foreground transition-colors">
          {product.categories[0]?.name ?? "Shop"}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-muted/30 rounded-2xl md:rounded-[28px] overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-muted-foreground/30 font-semibold tracking-[0.15em] uppercase text-sm">
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
                  className={`relative aspect-square w-20 rounded-xl overflow-hidden bg-muted/30 transition-all ${
                    selectedImageIndex === index
                      ? "ring-2 ring-primary ring-offset-2"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="w-full h-full flex items-center justify-center">
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
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest border-border/60 hover:bg-muted transition-colors"
                >
                  {cat.name}
                </Badge>
              </Link>
            ))}
            {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
              <Badge className="rounded-full px-3 py-1 text-xs font-medium bg-amber-500/10 text-amber-600 hover:bg-amber-500/10 border-0">
                Only {product.stockQuantity} left
              </Badge>
            )}
          </div>

          {/* Name & Price */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {product.name}
            </h1>
            <span className="text-2xl font-semibold text-foreground">${product.price}</span>
          </div>

          {/* Description */}
          <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
            {product.description}
          </p>

          {/* Divider */}
          <div className="h-px bg-border/40" />

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Color{selectedColor && ` — ${selectedColor}`}
              </span>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    disabled={!color.inStock}
                    onClick={() => setSelectedColor(color.name)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${
                      selectedColor === color.name
                        ? "border-foreground bg-foreground text-background"
                        : color.inStock
                          ? "border-border/60 text-foreground hover:border-foreground/40"
                          : "border-border/30 text-muted-foreground/40 cursor-not-allowed line-through"
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
              <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Size{selectedSize && ` — ${selectedSize}`}
              </span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    disabled={!size.inStock}
                    onClick={() => setSelectedSize(size.name)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${
                      selectedSize === size.name
                        ? "border-foreground bg-foreground text-background"
                        : size.inStock
                          ? "border-border/60 text-foreground hover:border-foreground/40"
                          : "border-border/30 text-muted-foreground/40 cursor-not-allowed line-through"
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4 bg-muted/40 rounded-full px-4 py-2 text-sm font-medium">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  −
                </button>
                <span className="min-w-6 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <Button
                size="lg"
                className="flex-1 rounded-full h-12 text-base font-semibold shadow-lg shadow-primary/10 gap-2"
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
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">You might also like</h2>
              <p className="text-muted-foreground">
                More from {product.categories[0]?.name ?? "this collection"}
              </p>
            </div>
            <Link
              href="/categories"
              className="hidden sm:flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
            >
              View all <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
