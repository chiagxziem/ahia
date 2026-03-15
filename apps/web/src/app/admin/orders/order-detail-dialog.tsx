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
import type { AdminOrderRow } from "@/features/admin/queries";
import { formatCurrency, truncateId } from "@/lib/utils";

interface OrderDetailDialogProps {
  order: AdminOrderRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabel: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  cancelled: "Cancelled",
  completed: "Completed",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  processing: "default",
  cancelled: "destructive",
  completed: "default",
};

const paymentLabel: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

const paymentVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  paid: "default",
  failed: "destructive",
  refunded: "outline",
};

export const OrderDetailDialog = ({ order, open, onOpenChange }: OrderDetailDialogProps) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!order) return null;

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(order.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>{order.orderNumber}</DialogTitle>
        </DialogHeader>

        {/* Header: Order number + badges */}
        <div className="flex items-start gap-4">
          <div className="flex min-w-0 flex-1 flex-col">
            <h3 className="text-lg leading-tight font-semibold">{order.orderNumber}</h3>
            <p className="text-sm text-muted-foreground">
              {order.customer?.name ?? "Unknown"} &middot; {order.email}
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Badge variant={statusVariant[order.status] ?? "secondary"}>
                {statusLabel[order.status] ?? order.status}
              </Badge>
              <Badge variant={paymentVariant[order.paymentStatus] ?? "secondary"}>
                {paymentLabel[order.paymentStatus] ?? order.paymentStatus}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{formatCurrency(Number(order.totalAmount))}</p>
            <p className="text-xs text-muted-foreground">
              {order.orderItems.length} {order.orderItems.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        <Separator />

        {/* Order items */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">Products</span>
          <div className="-mx-4 no-scrollbar max-h-[40vh] overflow-y-auto px-4">
            <div className="flex flex-col gap-3">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.product.images.length > 0 ? (
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                      N/A
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{item.product.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(Number(item.unitPrice))} &times; {item.quantity}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-medium">
                    {formatCurrency(Number(item.subTotal))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-sm font-medium">Total</span>
            <span className="text-sm font-semibold">
              {formatCurrency(Number(order.totalAmount))}
            </span>
          </div>
        </div>

        <Separator />

        {/* Detail rows */}
        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="shrink-0 text-sm text-muted-foreground">Order ID</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs">{truncateId(order.id)}</span>
              <Button
                size="icon-sm"
                variant="ghost"
                className="size-6 shrink-0"
                onClick={handleCopyId}
                disabled={isCopied}
                aria-label={isCopied ? "Copied" : "Copy order ID"}
              >
                <HugeiconsIcon icon={isCopied ? Tick01Icon : Copy01Icon} className="size-3.5" />
              </Button>
            </div>
          </div>
          {order.paymentMethod && <DetailRow label="Payment method" value={order.paymentMethod} />}
          <DetailRow label="Ordered" value={format(order.createdAt, "MMM d, yyyy 'at' h:mm a")} />
          <DetailRow
            label="Last updated"
            value={format(order.updatedAt, "MMM d, yyyy 'at' h:mm a")}
          />
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-xs">{value}</span>
    </div>
  );
};
