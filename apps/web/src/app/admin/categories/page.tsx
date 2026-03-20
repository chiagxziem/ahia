import { CategoriesClient } from "./categories-client";

const AdminCategoriesPage = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bricolage text-3xl font-bold tracking-tight">
            Categories
          </h1>
          <p className="text-muted-foreground">Manage product categories.</p>
        </div>
      </div>

      <CategoriesClient />
    </div>
  );
};

export default AdminCategoriesPage;
