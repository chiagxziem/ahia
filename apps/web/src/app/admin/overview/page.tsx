import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { headers } from "next/headers";

import { getAdminStats } from "@/features/admin/queries";
import { queryKeys } from "@/lib/query-keys";

import { OverviewStats } from "./overview-stats";

const AdminOverviewPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.adminStats(),
    queryFn: async () => getAdminStats((await headers()).get("cookie") ?? undefined),
  });

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="font-bricolage text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Welcome to the Ahia admin dashboard.</p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <OverviewStats />
      </HydrationBoundary>
    </div>
  );
};

export default AdminOverviewPage;
