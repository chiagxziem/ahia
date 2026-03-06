"use client";

import {
  DashboardSquare01Icon,
  LabelIcon,
  ShoppingBag01Icon,
  ShoppingCart01Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Facehash } from "facehash";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getInitials, truncateEmail } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    url: "/admin",
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
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex h-14 items-center px-4">
            <Link href="/admin" className="font-bricolage text-lg font-bold">
              Ahia Admin
            </Link>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
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
        <div className="flex items-center gap-3 p-2">
          {!user.image ? (
            <Facehash
              name={user.name}
              size={36}
              variant="solid"
              intensity3d="none"
              enableBlink
              className="shrink-0 rounded-md border bg-muted text-muted-foreground"
            />
          ) : (
            <Avatar size="sm" className={"shrink-0 rounded-md after:rounded-md"}>
              <AvatarImage src={user.image} alt={user.name} className={"rounded-md"} />
              <AvatarFallback className="rounded-md text-[10px] font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm leading-none font-medium text-foreground">
              {user.name}
            </span>
            <span className="mt-1 truncate text-xs leading-none text-muted-foreground">
              {truncateEmail(user.email)}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
