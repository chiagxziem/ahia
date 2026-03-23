"use client";

import {
  Cancel01Icon,
  ShoppingBag01Icon,
  ShoppingCart01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cancelToastEl } from "@/components/ui/sonner";
import {
  clearCart,
  createCheckout,
  removeCartItem,
  updateCartItemQuantity,
} from "@/features/cart/actions";
import { getCart } from "@/features/cart/queries";
import { getUser } from "@/features/user/queries";
import { queryKeys } from "@/lib/query-keys";
import { getApiError } from "@/lib/utils";

export const CartDrawer = () => {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: queryKeys.user(),
    queryFn: () => getUser(),
  });

  const { data: cart } = useQuery({
    queryKey: queryKeys.cart(),
    queryFn: getCart,
    enabled: !!user,
  });

  const cartItems = cart?.cartItems ?? [];
  const itemCount = cart?.totalItems ?? 0;
  const totalAmount = cart?.totalAmount ?? "0.00";

  const updateQtyMutation = useMutation({
    mutationFn: updateCartItemQuantity,
    onSuccess: ({ data }) => {
      queryClient.setQueryData(queryKeys.cart(), data ?? null);
    },
    onError: (err) => {
      toast.error(
        getApiError(err) || "Failed to update cart item.",
        cancelToastEl,
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: ({ data }) => {
      queryClient.setQueryData(queryKeys.cart(), data ?? null);
    },
    onError: (err) => {
      toast.error(
        getApiError(err) || "Failed to remove cart item.",
        cancelToastEl,
      );
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: ({ data }) => {
      queryClient.setQueryData(queryKeys.cart(), data ?? null);
    },
    onError: (err) => {
      toast.error(getApiError(err) || "Failed to clear cart.", cancelToastEl);
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: createCheckout,
    onSuccess: ({ data }) => {
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (err) => {
      toast.error(
        getApiError(err) || "Failed to create checkout.",
        cancelToastEl,
      );
    },
  });

  const handleDecrement = (itemId: string, currentQty: number) => {
    if (currentQty <= 1) {
      removeMutation.mutate(itemId);
    } else {
      updateQtyMutation.mutate({ itemId, quantity: currentQty - 1 });
    }
  };

  const handleIncrement = (
    itemId: string,
    currentQty: number,
    stockQty: number,
  ) => {
    if (currentQty >= stockQty) return;
    updateQtyMutation.mutate({ itemId, quantity: currentQty + 1 });
  };

  return (
    <>
      {user ? (
        <Drawer open={open} onOpenChange={setOpen} direction="right">
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground/80 hover:text-foreground"
            >
              <HugeiconsIcon icon={ShoppingBag01Icon} className="size-5" />
              <span className="sr-only">Cart</span>
              {itemCount > 0 && (
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
              )}
            </Button>
          </DrawerTrigger>

          <DrawerContent className="h-full w-[90vw] rounded-none border-l-0 sm:w-100">
            {/* Header */}
            <DrawerHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/30 px-6 py-5">
              <div className="flex items-center gap-3">
                <DrawerTitle className="text-lg font-semibold tracking-tight">
                  Cart
                </DrawerTitle>
                <span className="text-sm font-medium text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full text-muted-foreground hover:text-foreground"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-4.5" />
                  <span className="sr-only">Close</span>
                </Button>
              </DrawerClose>
            </DrawerHeader>

            {/* Cart Items */}
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6">
              {cartItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
                  <HugeiconsIcon
                    icon={ShoppingCart01Icon}
                    className="size-12 opacity-20"
                  />
                  <p className="text-sm">Your cart is empty.</p>
                  <Button
                    onClick={() => setOpen(false)}
                    variant="outline"
                    className="rounded-full"
                    nativeButton={false}
                    render={<Link href="/shop" />}
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {cartItems.map((item) => {
                    const thumbnail = item.product.images?.[0]?.url;
                    const isMutating =
                      (updateQtyMutation.isPending &&
                        updateQtyMutation.variables?.itemId === item.id) ||
                      (removeMutation.isPending &&
                        removeMutation.variables === item.id);

                    return (
                      <div
                        key={item.id}
                        className={`group flex gap-4 transition-opacity ${isMutating ? "opacity-50" : ""}`}
                      >
                        {/* Thumbnail */}
                        <div className="size-18 shrink-0 overflow-hidden rounded-xl bg-muted/30">
                          {thumbnail && (
                            <Image
                              src={thumbnail}
                              alt={item.product.name}
                              width={72}
                              height={72}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="truncate text-sm leading-snug font-medium">
                              {item.product.name}
                            </span>
                            <span className="text-sm font-semibold whitespace-nowrap">
                              ${item.subAmount}
                            </span>
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-3 rounded-full bg-muted/30 px-2.5 py-1 text-xs font-medium">
                              <button
                                onClick={() =>
                                  handleDecrement(item.id, item.quantity)
                                }
                                disabled={isMutating}
                                className="px-0.5 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed"
                              >
                                −
                              </button>
                              <span className="min-w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleIncrement(
                                    item.id,
                                    item.quantity,
                                    item.product.stockQuantity ?? 0,
                                  )
                                }
                                disabled={
                                  isMutating ||
                                  item.quantity >=
                                    (item.product.stockQuantity ?? 0)
                                }
                                className="px-0.5 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeMutation.mutate(item.id)}
                              disabled={isMutating}
                              className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <DrawerFooter className="flex flex-col gap-4 border-t border-border/30 px-6 py-5">
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="text-base font-semibold">
                    ${totalAmount}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    size="lg"
                    className="h-12 w-full rounded-full text-sm"
                    onClick={() => checkoutMutation.mutate()}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending
                      ? "Redirecting..."
                      : "Continue to Checkout"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => clearCartMutation.mutate()}
                    disabled={clearCartMutation.isPending}
                    className="h-12 w-full rounded-full text-sm"
                  >
                    Clear cart
                  </Button>
                </div>
              </DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>
      ) : null}
    </>
  );
};
