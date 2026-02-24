"use client";

import { DashboardSquare01Icon, Logout03Icon, Settings01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export function UserMenu() {
  const user = DUMMY_USER;
  const isSignedIn = true; // Toggle to false to see guest UI

  // Guest state
  if (!isSignedIn) {
    return (
      <>
        <Button
          variant="ghost"
          nativeButton={false}
          className="text-muted-foreground hover:text-foreground md:flex hidden text-[13px] font-medium"
          render={<Link href="/login" />}
        >
          Log in
        </Button>
      </>
    );
  }

  // Signed-in state
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <Avatar size="sm">
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback className="text-[10px] font-semibold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <span className="sr-only">User menu</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        {/* User info */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium leading-none">{user.name}</span>
              <span className="text-xs text-muted-foreground leading-none">{user.email}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Navigation */}
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/settings" />}>
            <HugeiconsIcon icon={Settings01Icon} className="size-4" />
            Settings
          </DropdownMenuItem>

          {/* Admin-only: Dashboard link */}
          {user.isAdmin && (
            <DropdownMenuItem render={<Link href="/admin" />}>
              <HugeiconsIcon icon={DashboardSquare01Icon} className="size-4" />
              Admin Dashboard
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem>
          <HugeiconsIcon icon={Logout03Icon} className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
