"use client";

import { Cancel01Icon, ShoppingCart01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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

// Dummy data for visual design
const CART_ITEMS = [
  { id: "1", name: "Minimalist Watch", price: "$120", quantity: 1 },
  { id: "2", name: "Essential Tee", price: "$35", quantity: 2 },
];

export function CartDrawer() {
  const [open, setOpen] = React.useState(false);
  const subtotal = 190;
  const itemCount = CART_ITEMS.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full relative text-foreground/80 hover:text-foreground"
        >
          <HugeiconsIcon icon={ShoppingCart01Icon} className="size-5.5" />
          <span className="sr-only">Cart</span>
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="w-[90vw] sm:w-100 h-full rounded-none border-l-0">
        {/* Header — title left, item count + close right */}
        <DrawerHeader className="border-b border-border/30 px-6 py-5 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <DrawerTitle className="text-lg font-semibold tracking-tight">Cart</DrawerTitle>
            <span className="text-sm text-muted-foreground font-medium">
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
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
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
                <div key={item.id} className="flex gap-4 group">
                  {/* Thumbnail */}
                  <div className="size-18 bg-muted/30 rounded-xl shrink-0 overflow-hidden" />

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-medium text-sm leading-snug truncate">{item.name}</span>
                      <span className="text-sm font-semibold whitespace-nowrap">{item.price}</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-3 bg-muted/30 rounded-full px-2.5 py-1 text-xs font-medium">
                        <button className="text-muted-foreground hover:text-foreground transition-colors px-0.5">
                          −
                        </button>
                        <span className="min-w-4 text-center">{item.quantity}</span>
                        <button className="text-muted-foreground hover:text-foreground transition-colors px-0.5">
                          +
                        </button>
                      </div>
                      <button className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors">
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
          <DrawerFooter className="border-t border-border/30 px-6 py-5 flex flex-col gap-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
              <span className="text-base font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Shipping and taxes calculated at checkout.
            </p>
            <Button
              size="lg"
              className="w-full rounded-full h-12 text-sm font-semibold shadow-lg shadow-primary/10"
            >
              Continue to Checkout
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
