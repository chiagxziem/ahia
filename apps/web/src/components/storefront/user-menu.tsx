"use client";

import {
  AccountSetting01Icon,
  DashboardSquare01Icon,
  Login01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Facehash } from "facehash";
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
import { DUMMY_USER, isSignedIn } from "@/lib/dummy-user";
import { getInitials } from "@/lib/utils";

export function UserMenu() {
  const user = DUMMY_USER;

  // Guest state
  if (!isSignedIn) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          className="text-muted-foreground hover:text-foreground"
          render={<Link href="/login" />}
        >
          <HugeiconsIcon icon={Login01Icon} className="size-5" />
          <span className="sr-only">Login</span>
        </Button>
      </>
    );
  }

  // Signed-in state
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative text-foreground/80 hover:text-foreground"
          >
            {!user.image ? (
              <Facehash
                name={user.name}
                size={24}
                variant="solid"
                intensity3d="none"
                enableBlink
                className="rounded-md border bg-muted text-muted-foreground"
              />
            ) : (
              <Avatar size="sm" className={"rounded-md after:rounded-md"}>
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="rounded-md text-[10px] font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="sr-only">User menu</span>
          </Button>
        }
      ></DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        {/* User info */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2 font-normal">
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
            <div className="flex flex-col gap-1">
              <span className="text-sm leading-none font-medium text-foreground">{user.name}</span>
              <span className="text-xs leading-none text-muted-foreground">{user.email}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Navigation */}
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/settings" />}>
            <HugeiconsIcon icon={AccountSetting01Icon} className="size-4" />
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
        <DropdownMenuItem variant="destructive">
          <HugeiconsIcon icon={Logout01Icon} className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
