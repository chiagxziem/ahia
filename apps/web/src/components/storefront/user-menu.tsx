"use client";

import {
  AccountSetting01Icon,
  DashboardSquare01Icon,
  Login01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Facehash } from "facehash";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { getUser } from "@/features/user/queries";
import { authClient } from "@/lib/auth-client";
import { queryKeys } from "@/lib/query-keys";
import { getInitials, roles, truncateEmail } from "@/lib/utils";

import { cancelToastEl } from "../ui/sonner";

export const UserMenu = ({ headers }: { headers: Headers }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: queryKeys.user(),
    queryFn: () => getUser(headers),
  });

  const signOutUser = async () => {
    toast.promise(
      authClient.signOut().then(async () => {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.user(),
        });
        router.push("/sign-in");
        return undefined;
      }),
      {
        loading: "Signing out...",
        success: "Signed out successfully",
        error: "Failed to sign out. Please try again.",
        ...cancelToastEl,
      },
    );
  };

  // Guest state
  if (!user) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          className="text-muted-foreground hover:text-foreground"
          render={<Link href="/sign-in" />}
        >
          <HugeiconsIcon icon={Login01Icon} className="size-5" />
          <span className="sr-only">Sign In</span>
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
                className="shrink-0 rounded-md border bg-muted text-muted-foreground"
              />
            ) : (
              <Avatar size="sm" className={"shrink-0 rounded-md after:rounded-md"}>
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="rounded-md text-[10px] font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="sr-only">User menu</span>
          </Button>
        }
      />

      <DropdownMenuContent align="end" sideOffset={8} className="w-64">
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
                className="shrink-0 rounded-xl border bg-muted text-muted-foreground"
              />
            ) : (
              <Avatar size="lg" className={"shrink-0 rounded-xl after:rounded-xl"}>
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="rounded-xl text-[10px] font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-sm leading-none font-medium text-foreground">
                {user.name}
              </span>
              <span className="truncate text-xs leading-none text-muted-foreground">
                {truncateEmail(user.email)}
              </span>
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
          {(user.role === roles.ADMIN || user.role === roles.SUPERADMIN) && (
            <DropdownMenuItem render={<Link href="/admin" />}>
              <HugeiconsIcon icon={DashboardSquare01Icon} className="size-4" />
              Admin Dashboard
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem variant="destructive" onClick={signOutUser}>
          <HugeiconsIcon icon={Logout01Icon} className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
