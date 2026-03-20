"use client";

import { Copy01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import Image from "next/image";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { AdminProductRow } from "@/features/admin/queries";
import { formatCurrency, truncateId } from "@/lib/utils";

import { ProductRowActions } from "./product-row-actions";

interface ProductDetailDialogProps {
  product: AdminProductRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailDialog({
  product,
  open,
  onOpenChange,
}: ProductDetailDialogProps) {
  const [isCopied, setIsCopied] = useState(false);

  if (!product) return null;

  const stockStatus =
    !product.stockQuantity || product.stockQuantity <= 0
      ? "Out of Stock"
      : product.stockQuantity <= 10
        ? "Low Stock"
        : "In Stock";

  const stockVariant =
    stockStatus === "Out of Stock"
      ? "destructive"
      : stockStatus === "Low Stock"
        ? "secondary"
        : "default";

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(product.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        {/* Product images */}
        {product.images.length > 0 && (
          <div className="flex gap-2">
            {product.images.map((img) => (
              <div
                key={img.key}
                className="relative aspect-square flex-1 overflow-hidden rounded-lg border bg-muted"
              >
                <Image
                  src={img.url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}

        {/* Header: Name + badges + Options */}
        <div className="flex items-start gap-4">
          <div className="flex min-w-0 flex-1 flex-col">
            <h3 className="truncate text-lg leading-tight font-semibold">
              {product.name}
            </h3>
            <p className="text-sm font-medium text-muted-foreground">
              {formatCurrency(Number(product.price))}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge variant={stockVariant}>{stockStatus}</Badge>
              {product.categories.map((cat) => (
                <Badge key={cat.id} variant="outline">
                  {cat.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="shrink-0">
            <ProductRowActions product={product} />
          </div>
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}

        <Separator />

        {/* Detail rows */}
        <div className="grid gap-3 text-sm">
          {/* Product ID with copy button */}
          <div className="flex items-center justify-between gap-4">
            <span className="shrink-0 text-sm text-muted-foreground">
              Product ID
            </span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs">
                {truncateId(product.id)}
              </span>
              <Button
                size="icon-sm"
                variant="ghost"
                className="size-6 shrink-0"
                onClick={handleCopyId}
                disabled={isCopied}
                aria-label={isCopied ? "Copied" : "Copy product ID"}
              >
                <HugeiconsIcon
                  icon={isCopied ? Tick01Icon : Copy01Icon}
                  className="size-3.5"
                />
              </Button>
            </div>
          </div>
          <DetailRow
            label="Stock quantity"
            value={String(product.stockQuantity ?? 0)}
          />
          {product.sizes.length > 0 && (
            <div className="flex items-start justify-between gap-4">
              <span className="shrink-0 text-sm text-muted-foreground">
                Sizes
              </span>
              <div className="flex flex-wrap justify-end gap-1">
                {product.sizes.map((s) => (
                  <Badge
                    key={s.name}
                    variant={s.inStock ? "default" : "secondary"}
                  >
                    {s.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {product.colors.length > 0 && (
            <div className="flex items-start justify-between gap-4">
              <span className="shrink-0 text-sm text-muted-foreground">
                Colors
              </span>
              <div className="flex flex-wrap justify-end gap-1">
                {product.colors.map((c) => (
                  <Badge
                    key={c.name}
                    variant={c.inStock ? "default" : "secondary"}
                  >
                    {c.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <DetailRow
            label="Created"
            value={format(product.createdAt, "MMM d, yyyy 'at' h:mm a")}
          />
          <DetailRow
            label="Last updated"
            value={format(product.updatedAt, "MMM d, yyyy 'at' h:mm a")}
          />
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-xs">{value}</span>
    </div>
  );
}
