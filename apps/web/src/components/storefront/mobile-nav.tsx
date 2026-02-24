"use client";

import {
  ArrowRight02Icon,
  Cancel01Icon,
  DashboardSquare01Icon,
  Home01Icon,
  Logout03Icon,
  Menu01Icon,
  Settings01Icon,
  ShoppingBag01Icon,
  StarIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home01Icon },
  { href: "/categories", label: "Shop", icon: ShoppingBag01Icon },
  { href: "/categories?c=new", label: "New Arrivals", icon: StarIcon },
];

// Dummy user data — replace with real auth data later
const DUMMY_USER = {
  name: "Jane Doe",
  email: "jane@example.com",
  image: "",
  isAdmin: true,
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const user = DUMMY_USER;
  const isSignedIn = true; // Toggle to false to see guest UI

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="left">
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="md:hidden rounded-full">
          <HugeiconsIcon icon={Menu01Icon} className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="w-[80vw] sm:w-80 h-full rounded-none border-r-0">
        {/* Header */}
        <DrawerHeader className="border-b border-border/30 px-5 py-4 flex flex-row items-center justify-between">
          <DrawerTitle className="text-lg font-bold tracking-tight">Ahia</DrawerTitle>
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

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col px-3 py-4 gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <HugeiconsIcon icon={link.icon} className="size-4.5 text-muted-foreground" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Footer — User section */}
        <div className="border-t border-border/30 px-3 py-4">
          {isSignedIn ? (
            <div className="flex flex-col gap-0.5">
              {/* User info */}
              <div className="flex items-center gap-3 px-3 py-3">
                <Avatar size="sm">
                  {user.image && <AvatarImage src={user.image} alt={user.name} />}
                  <AvatarFallback className="text-[10px] font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{user.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                </div>
              </div>

              {/* User actions */}
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <HugeiconsIcon icon={Settings01Icon} className="size-4.5 text-muted-foreground" />
                Settings
              </Link>

              {/* Admin-only link */}
              {user.isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  <HugeiconsIcon
                    icon={DashboardSquare01Icon}
                    className="size-4.5 text-muted-foreground"
                  />
                  Admin Dashboard
                </Link>
              )}

              <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors w-full text-left">
                <HugeiconsIcon icon={Logout03Icon} className="size-4.5 text-muted-foreground" />
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <HugeiconsIcon icon={UserCircleIcon} className="size-4.5 text-muted-foreground" />
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
              >
                Create account
                <HugeiconsIcon icon={ArrowRight02Icon} className="size-4 text-primary/60" />
              </Link>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
