import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { CategoriesClient } from "./categories-client";

// Mock data fetcher to simulate Cache Component feature with suspense
const fetchCategories = async () => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return [
    {
      id: "cat_1",
      name: "Electronics",
      slug: "electronics",
      productCount: 145,
    },
    {
      id: "cat_2",
      name: "Apparel",
      slug: "apparel",
      productCount: 320,
    },
    {
      id: "cat_3",
      name: "Home & Garden",
      slug: "home-and-garden",
      productCount: 89,
    },
    {
      id: "cat_4",
      name: "Sports",
      slug: "sports",
      productCount: 201,
    },
  ];
};

const CategoriesData = async () => {
  const data = await fetchCategories();
  return <CategoriesClient data={data} />;
};

const AdminCategoriesPage = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bricolage text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage product categories.</p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-100 w-full rounded-md" />}>
        <CategoriesData />
      </Suspense>
    </div>
  );
};

export default AdminCategoriesPage;
