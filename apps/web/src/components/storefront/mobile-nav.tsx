"use client";

import {
  AccountSetting01Icon,
  Cancel01Icon,
  DashboardSquare01Icon,
  Home01Icon,
  Login01Icon,
  Logout01Icon,
  Menu01Icon,
  ShoppingBag01Icon,
  StarIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Facehash } from "facehash";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { DUMMY_USER, isSignedIn } from "@/lib/dummy-user";
import { getInitials } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home01Icon },
  { href: "/categories", label: "Shop", icon: ShoppingBag01Icon },
  { href: "/categories?c=new", label: "New Arrivals", icon: StarIcon },
];

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const user = DUMMY_USER;

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="left">
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <HugeiconsIcon icon={Menu01Icon} className="size-4.5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="h-full w-[80vw] border-r-0 sm:w-80">
        {/* Header */}
        <DrawerHeader className="flex flex-row items-center justify-between border-b border-border/30 px-5 py-4">
          <DrawerTitle className="text-lg font-bold tracking-tight">Ahia</DrawerTitle>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-4.5" />
              <span className="sr-only">Close</span>
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {/* Navigation Links */}
        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground"
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
                {!user.image ? (
                  <Facehash
                    name={user.name}
                    size={40}
                    variant="solid"
                    intensity3d="medium"
                    enableBlink
                    className="rounded-xl border bg-muted text-muted-foreground"
                  />
                ) : (
                  <Avatar size="lg" className={"rounded-xl after:rounded-xl"}>
                    {user.image && <AvatarImage src={user.image} alt={user.name} />}
                    <AvatarFallback className="rounded-xl text-[10px] font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>

              {/* User actions */}
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <HugeiconsIcon
                  icon={AccountSetting01Icon}
                  className="size-4.5 text-muted-foreground"
                />
                Settings
              </Link>

              {/* Admin-only link */}
              {user.isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground"
                >
                  <HugeiconsIcon
                    icon={DashboardSquare01Icon}
                    className="size-4.5 text-muted-foreground"
                  />
                  Admin Dashboard
                </Link>
              )}

              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground">
                <HugeiconsIcon icon={Logout01Icon} className="size-4.5 text-muted-foreground" />
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <HugeiconsIcon icon={Login01Icon} className="size-4.5 text-muted-foreground" />
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <HugeiconsIcon icon={UserCircleIcon} className="size-4.5 text-primary/60" />
                Create account
              </Link>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
