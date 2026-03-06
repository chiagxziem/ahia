import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { OrdersClient } from "./orders-client";

// Mock data fetcher to simulate Cache Component feature with suspense
const fetchOrders = async () => {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return [
    {
      id: "ord_1001",
      customer: "Alice Smith",
      date: "2024-03-01T10:00:00Z",
      total: 129.5,
      status: "delivered",
    },
    {
      id: "ord_1002",
      customer: "Bob Jones",
      date: "2024-03-02T14:30:00Z",
      total: 89.99,
      status: "shipped",
    },
    {
      id: "ord_1003",
      customer: "Charlie Brown",
      date: "2024-03-05T09:15:00Z",
      total: 245.0,
      status: "processing",
    },
    {
      id: "ord_1004",
      customer: "Diana Prince",
      date: "2024-03-06T16:45:00Z",
      total: 45.0,
      status: "pending",
    },
    {
      id: "ord_1005",
      customer: "Evan Wright",
      date: "2024-03-07T11:20:00Z",
      total: 670.0,
      status: "processing",
    },
  ];
};

const OrdersData = async () => {
  const data = await fetchOrders();
  return <OrdersClient data={data} />;
};

const AdminOrdersPage = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bricolage text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and fulfillment.</p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-125 w-full rounded-md" />}>
        <OrdersData />
      </Suspense>
    </div>
  );
};

export default AdminOrdersPage;
