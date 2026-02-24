"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { CartDrawer } from "./cart-drawer";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Shop" },
  { href: "/categories?c=new", label: "New Arrivals" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-lg border-b border-border/30">
      <div className="w-full max-w-300 mx-auto px-4 md:px-8 flex h-14 md:h-16 items-center justify-between">
        {/* Left: Mobile nav + Logo */}
        <div className="flex items-center gap-3">
          <MobileNav />
          <Link href="/" className="flex items-center">
            <span className="text-lg font-bold tracking-tight">Ahia</span>
          </Link>
        </div>

        {/* Center: Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon icon={Search01Icon} className="size-4.5" />
            <span className="sr-only">Search</span>
          </Button>
          <UserMenu />
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}
