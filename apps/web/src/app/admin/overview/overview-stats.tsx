"use client";

import {
  Dollar02Icon,
  ShoppingBag01Icon,
  ShoppingCart01Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminStats } from "@/features/admin/queries";
import { queryKeys } from "@/lib/query-keys";
import { formatCurrency, formatPct } from "@/lib/utils";

export const OverviewStats = () => {
  const { data: stats } = useQuery({
    queryKey: queryKeys.adminStats(),
    queryFn: () => getAdminStats(),
  });

  const revenue = stats?.revenue.value["1m"] ?? 0;
  const revenuePct = stats?.revenue.changePct["1m"] ?? 0;

  const orders = stats?.orders.value["1m"] ?? 0;
  const ordersPct = stats?.orders.changePct["1m"] ?? 0;

  const products = stats?.products.value.total ?? 0;
  const productsPct = stats?.products.changePct["1m"] ?? 0;

  const users = stats?.users.value.total ?? 0;
  const usersDelta24h = stats?.users.change["24h"] ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <HugeiconsIcon icon={Dollar02Icon} className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(revenue)}</div>
          <p className="text-xs text-muted-foreground">{formatPct(revenuePct)} from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orders</CardTitle>
          <HugeiconsIcon icon={ShoppingCart01Icon} className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{orders.toLocaleString("en-US")}</div>
          <p className="text-xs text-muted-foreground">{formatPct(ordersPct)} from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Products</CardTitle>
          <HugeiconsIcon icon={ShoppingBag01Icon} className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{products.toLocaleString("en-US")}</div>
          <p className="text-xs text-muted-foreground">{formatPct(productsPct)} from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Users</CardTitle>
          <HugeiconsIcon icon={UserMultipleIcon} className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{users.toLocaleString("en-US")}</div>
          <p className="text-xs text-muted-foreground">
            {usersDelta24h} active in the last 24 hours
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
