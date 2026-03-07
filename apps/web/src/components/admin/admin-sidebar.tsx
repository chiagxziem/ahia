"use client";

import {
  AccountSetting01Icon,
  DashboardSquare01Icon,
  Home03Icon,
  LabelIcon,
  Logout01Icon,
  PaintBrush02Icon,
  ShoppingBag01Icon,
  ShoppingBasketSecure01Icon,
  ShoppingCart01Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { Facehash } from "facehash";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cancelToastEl } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";
import { queryKeys } from "@/lib/query-keys";
import { getInitials, truncateEmail } from "@/lib/utils";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";

const navItems = [
  {
    title: "Overview",
    url: "/admin/overview",
    icon: DashboardSquare01Icon,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: UserMultipleIcon,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: LabelIcon,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: ShoppingBag01Icon,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ShoppingCart01Icon,
  },
];

export const AdminSidebar = ({ user }: { user: any }) => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { isMobile, setOpenMobile } = useSidebar();

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

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="" size={"lg"} render={<Link href="/admin" />}>
              <div className="rounded-lg bg-foreground p-1.5 text-background">
                <HugeiconsIcon icon={ShoppingBasketSecure01Icon} className="size-5!" />
              </div>
              <span className="text-base font-semibold">Ahia Admin</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setOpenMobile(false)}
                      render={<Link href={item.url} />}
                    >
                      <HugeiconsIcon icon={item.icon} className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  />
                }
              >
                {!user.image ? (
                  <Facehash
                    name={user.name}
                    size={36}
                    variant="solid"
                    intensity3d="none"
                    enableBlink
                    className="shrink-0 rounded-lg border bg-muted text-muted-foreground"
                  />
                ) : (
                  <Avatar size="sm" className={"shrink-0 rounded-lg after:rounded-lg"}>
                    <AvatarImage src={user.image} alt={user.name} className={"rounded-lg"} />
                    <AvatarFallback className="rounded-lg text-[10px] font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-sm font-medium text-foreground">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {truncateEmail(user.email)}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-56"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex items-center gap-2 font-normal">
                    {!user.image ? (
                      <Facehash
                        name={user.name}
                        size={40}
                        variant="solid"
                        intensity3d="medium"
                        enableBlink
                        className="shrink-0 rounded-lg border bg-muted text-muted-foreground"
                      />
                    ) : (
                      <Avatar size="lg" className={"shrink-0 rounded-lg after:rounded-lg"}>
                        {user.image && (
                          <AvatarImage src={user.image} alt={user.name} className={"rounded-lg"} />
                        )}
                        <AvatarFallback className="rounded-lg text-[10px] font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate text-sm font-medium text-foreground">
                        {user.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {truncateEmail(user.email)}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Navigation */}
                <DropdownMenuGroup>
                  <DropdownMenuItem render={<Link href="/" />}>
                    <HugeiconsIcon icon={Home03Icon} className="size-4" />
                    Storefront
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <HugeiconsIcon icon={PaintBrush02Icon} className="size-4" />
                    Theme
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/settings" />}>
                    <HugeiconsIcon icon={AccountSetting01Icon} className="size-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Sign out */}
                <DropdownMenuItem variant="destructive" onClick={signOutUser}>
                  <HugeiconsIcon icon={Logout01Icon} className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
