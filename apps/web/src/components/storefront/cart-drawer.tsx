"use client";

import { Cancel01Icon, ShoppingBag01Icon, ShoppingCart01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import * as React from "react";

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
import { getUser } from "@/features/user/queries";
import { queryKeys } from "@/lib/query-keys";

// Dummy data for visual design
const CART_ITEMS = [
  { id: "1", name: "Minimalist Watch", price: "$120", quantity: 1 },
  { id: "2", name: "Essential Tee", price: "$35", quantity: 2 },
];

export const CartDrawer = ({ headers }: { headers: Headers }) => {
  const [open, setOpen] = React.useState(false);

  const { data: user } = useQuery({
    queryKey: queryKeys.user(),
    queryFn: () => getUser(headers),
  });

  const subtotal = 190;
  const itemCount = CART_ITEMS.reduce((acc, item) => acc + item.quantity, 0);

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
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
            </Button>
          </DrawerTrigger>

          <DrawerContent className="h-full w-[90vw] rounded-none border-l-0 sm:w-100">
            {/* Header — title left, item count + close right */}
            <DrawerHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/30 px-6 py-5">
              <div className="flex items-center gap-3">
                <DrawerTitle className="text-lg font-semibold tracking-tight">Cart</DrawerTitle>
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
              {CART_ITEMS.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
                  <HugeiconsIcon icon={ShoppingCart01Icon} className="size-12 opacity-20" />
                  <p className="text-sm">Your cart is empty.</p>
                  <Button
                    onClick={() => setOpen(false)}
                    variant="outline"
                    className="rounded-full"
                    render={<Link href="/categories" />}
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {CART_ITEMS.map((item) => (
                    <div key={item.id} className="group flex gap-4">
                      {/* Thumbnail */}
                      <div className="size-18 shrink-0 overflow-hidden rounded-xl bg-muted/30" />

                      {/* Details */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="truncate text-sm leading-snug font-medium">
                            {item.name}
                          </span>
                          <span className="text-sm font-semibold whitespace-nowrap">
                            {item.price}
                          </span>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-3 rounded-full bg-muted/30 px-2.5 py-1 text-xs font-medium">
                            <button className="px-0.5 text-muted-foreground transition-colors hover:text-foreground">
                              −
                            </button>
                            <span className="min-w-4 text-center">{item.quantity}</span>
                            <button className="px-0.5 text-muted-foreground transition-colors hover:text-foreground">
                              +
                            </button>
                          </div>
                          <button className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {CART_ITEMS.length > 0 && (
              <DrawerFooter className="flex flex-col gap-4 border-t border-border/30 px-6 py-5">
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
                  <span className="text-base font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Shipping and taxes calculated at checkout.
                </p>
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full text-sm font-semibold shadow-lg shadow-primary/10"
                >
                  Continue to Checkout
                </Button>
              </DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>
      ) : null}
    </>
  );
};
