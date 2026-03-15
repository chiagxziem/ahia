import { OrdersClient } from "./orders-client";

const AdminOrdersPage = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bricolage text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and fulfillment.</p>
        </div>
      </div>

      <OrdersClient />
    </div>
  );
};

export default AdminOrdersPage;
