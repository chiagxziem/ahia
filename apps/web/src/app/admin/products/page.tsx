import { ProductsClient } from "./products-client";

const AdminProductsPage = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bricolage text-3xl font-bold tracking-tight">
            Products
          </h1>
          <p className="text-muted-foreground">
            Manage your store's inventory and products.
          </p>
        </div>
      </div>

      <ProductsClient />
    </div>
  );
};

export default AdminProductsPage;
