import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { ProductsClient } from "./products-client";

// Mock data fetcher to simulate Cache Component feature with suspense
const fetchProducts = async () => {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return [
    {
      id: "prod_1",
      name: "Wireless Headphones",
      category: "Electronics",
      price: 199.99,
      stock: 45,
      status: "in_stock",
    },
    {
      id: "prod_2",
      name: "Cotton T-Shirt",
      category: "Apparel",
      price: 24.5,
      stock: 0,
      status: "out_of_stock",
    },
    {
      id: "prod_3",
      name: "Smart Watch",
      category: "Electronics",
      price: 299.0,
      stock: 5,
      status: "low_stock",
    },
    {
      id: "prod_4",
      name: "Running Shoes",
      category: "Sports",
      price: 120.0,
      stock: 120,
      status: "in_stock",
    },
    {
      id: "prod_5",
      name: "Coffee Maker",
      category: "Home & Garden",
      price: 85.0,
      stock: 22,
      status: "in_stock",
    },
  ];
};

const ProductsData = async () => {
  const data = await fetchProducts();
  return <ProductsClient data={data} />;
};

const AdminProductsPage = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bricolage text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your store's inventory and products.</p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-125 w-full rounded-md" />}>
        <ProductsData />
      </Suspense>
    </div>
  );
};

export default AdminProductsPage;
