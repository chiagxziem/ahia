"use client";

import { Edit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";

import { type ActionButton, DataTable, type FilterConfig } from "@/components/ui/data-table";

type Category = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "productCount",
    header: "Products",
  },
];

const filters: FilterConfig[] = [
  {
    type: "search",
    placeholder: "Search categories...",
    searchColumns: ["name", "slug"],
  },
];

const actionButtons: ActionButton[] = [
  {
    label: "New Category",
    icon: <HugeiconsIcon icon={Edit01Icon} className="mr-2 size-4" />,
    onClick: () => console.log("New category"),
  },
];

export const CategoriesClient = ({ data }: { data: Category[] }) => {
  return (
    <DataTable columns={columns} data={data} filters={filters} actionButtons={actionButtons} />
  );
};
