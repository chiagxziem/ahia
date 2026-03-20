"use client";

import {
  ArrowRight02Icon,
  MinusSignIcon,
  PlusSignIcon,
  ShoppingCart01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/storefront/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cancelToastEl } from "@/components/ui/sonner";
import {
  addToCart,
  getProductById,
  getRelatedProducts,
} from "@/features/storefront/queries";
import { queryKeys } from "@/lib/query-keys";
import { getApiError } from "@/lib/utils";

export const ProductDetail = ({ productId }: { productId: string }) => {
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: queryKeys.product(productId),
    queryFn: () => getProductById(productId),
  });

  const categorySlug = product?.categories?.[0]?.slug;

  const { data: relatedProducts } = useQuery({
    queryKey: queryKeys.relatedProducts(productId),
    queryFn: () => getRelatedProducts(productId, categorySlug),
    enabled: !!product,
  });

  const [selectedColor, setSelectedColor] = useQueryState(
    "color",
    parseAsString.withOptions({ shallow: false }),
  );
  const [selectedSize, setSelectedSize] = useQueryState(
    "size",
    parseAsString.withOptions({ shallow: false }),
  );
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const addToCartMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
      toast.success("Added to cart!", cancelToastEl);
    },
    onError: (err) => {
      toast.error(getApiError(err) || "Failed to add to cart.", cancelToastEl);
    },
  });

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCartMutation.mutate({ productId: product.id, quantity });
  }, [product, quantity, addToCartMutation]);

  const handleQuantityInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (Number.isNaN(val) || val < 1) {
        setQuantity(1);
      } else if (product && val > (product.stockQuantity ?? 0)) {
        setQuantity(product.stockQuantity ?? 1);
      } else {
        setQuantity(val);
      }
    },
    [product],
  );

  const selectedImage = useMemo(
    () => product?.images?.[selectedImageIndex],
    [product, selectedImageIndex],
  );

  const isOnlyInCategory = useMemo(() => {
    if (!relatedProducts) return false;
    return relatedProducts.length === 0;
  }, [relatedProducts]);

  if (isLoading) {
    return <ProductSkeleton />;
  }

  if (!product) {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-32 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="text-muted-foreground">
          The product you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button
          nativeButton={false}
          variant="outline"
          className="rounded-full"
          render={<Link href="/shop" />}
        >
          Back to Shop
        </Button>
      </div>
    );
  }

  const stockQty = product.stockQuantity ?? 0;

  return (
    <div className="container w-full px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link
          href={categorySlug ? `/shop?cat=${categorySlug}` : "/shop"}
          className="transition-colors hover:text-foreground"
        >
          {product.categories?.[0]?.name ?? "Shop"}
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
            {selectedImage?.url && !failedImages.has(selectedImage.url) ? (
              <Image
                src={selectedImage.url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                onError={() =>
                  setFailedImages((prev) =>
                    new Set(prev).add(selectedImage.url),
                  )
                }
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-sm font-semibold tracking-[0.15em] text-muted-foreground/30 uppercase">
                  Product Photo
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto p-1">
              {product.images.map((image, index) => (
                <button
                  key={image.key}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl bg-muted/30 transition-all ${
                    selectedImageIndex === index
                      ? "ring-2 ring-primary ring-offset-2"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {image.url && !failedImages.has(image.url) ? (
                    <Image
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                      onError={() =>
                        setFailedImages((prev) => new Set(prev).add(image.url))
                      }
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="size-6 rounded-full bg-muted-foreground/5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6 lg:pt-2">
          {/* Category & Tags */}
          <div className="flex items-center gap-3">
            {product.categories?.map((cat) => (
              <Link key={cat.slug} href={`/shop?cat=${cat.slug}`}>
                <Badge
                  variant="outline"
                  className="rounded-full border-border/60 px-3 py-1 text-xs font-semibold tracking-widest uppercase transition-colors hover:bg-muted"
                >
                  {cat.name}
                </Badge>
              </Link>
            ))}
            {stockQty > 0 && stockQty <= 5 && (
              <Badge className="rounded-full border-0 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 hover:bg-amber-500/10">
                Only {stockQty} left
              </Badge>
            )}
          </div>

          {/* Name & Price */}
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {product.name}
            </h1>
            <span className="text-2xl font-semibold text-foreground">
              ${product.price}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

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
                    onClick={() =>
                      void setSelectedColor(
                        selectedColor === color.name ? null : color.name,
                      )
                    }
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
                    onClick={() =>
                      void setSelectedSize(
                        selectedSize === size.name ? null : size.name,
                      )
                    }
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
              {/* Quantity Selector (ButtonGroup) */}
              <ButtonGroup
                aria-label="Quantity"
                className="[&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-full!"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="size-12 rounded-l-full! border-r-0"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <HugeiconsIcon icon={MinusSignIcon} className="size-4" />
                </Button>
                <Input
                  type="number"
                  min={1}
                  max={stockQty || undefined}
                  value={quantity}
                  onChange={handleQuantityInput}
                  className="h-12 w-14 [appearance:textfield] rounded-none border-x-0 text-center font-semibold [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="size-12 rounded-r-full!"
                  onClick={() =>
                    setQuantity(Math.min(stockQty || 999, quantity + 1))
                  }
                  disabled={stockQty > 0 && quantity >= stockQty}
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                </Button>
              </ButtonGroup>

              {/* Add to Cart */}
              <Button
                size="lg"
                className="h-12 flex-1 gap-2 rounded-full text-base font-semibold shadow-lg shadow-primary/10"
                disabled={stockQty === 0 || addToCartMutation.isPending}
                onClick={handleAddToCart}
              >
                <HugeiconsIcon icon={ShoppingCart01Icon} className="size-5" />
                {stockQty === 0
                  ? "Out of Stock"
                  : addToCartMutation.isPending
                    ? "Adding…"
                    : "Add to Cart"}
              </Button>
            </div>
          </div>

          {/* Stock info */}
          {stockQty > 0 && (
            <p className="text-sm text-muted-foreground">
              {stockQty} in stock · Free shipping on orders over $100
            </p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-24 mb-16">
          <div className="flex flex-col gap-8">
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  You might also like
                </h2>
                <p className="text-muted-foreground">
                  {isOnlyInCategory
                    ? "Explore more from our collection"
                    : `More from ${product.categories?.[0]?.name ?? "this collection"}`}
                </p>
              </div>
              <Link
                href="/shop"
                className="hidden items-center gap-1 text-sm font-medium transition-colors hover:text-primary sm:flex"
              >
                View all{" "}
                <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  id={relatedProduct.id}
                  name={relatedProduct.name}
                  price={relatedProduct.price}
                  category={relatedProduct.categories?.[0]?.name ?? ""}
                  slug={relatedProduct.slug}
                  imageUrl={relatedProduct.images?.[0]?.url}
                />
              ))}
            </div>

            {/* Mobile "View all" link */}
            <Link
              href="/shop"
              className="flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:hidden"
            >
              View all products{" "}
              <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export const ProductSkeleton = () => (
  <div className="container w-full px-4 py-8 md:py-12">
    <Skeleton className="mb-8 h-4 w-48" />
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-4">
        <Skeleton className="aspect-square w-full rounded-2xl md:rounded-[28px]" />
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-square w-20 shrink-0 rounded-xl"
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6 lg:pt-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="h-4 w-3/4 max-w-lg" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-20 rounded-full" />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-36 rounded-full" />
          <Skeleton className="h-12 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);
