"use client";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { type ActionButton, DataTable, type FilterConfig } from "@/components/ui/data-table";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
};

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const labels: Record<string, string> = {
        in_stock: "In Stock",
        out_of_stock: "Out of Stock",
        low_stock: "Low Stock",
      };
      const variants: Record<string, "default" | "secondary" | "destructive"> = {
        in_stock: "default",
        out_of_stock: "destructive",
        low_stock: "secondary",
      };
      return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
    },
  },
];

const filters: FilterConfig[] = [
  {
    type: "search",
    placeholder: "Search products...",
    searchColumns: ["name", "category"],
  },
  {
    type: "single-dropdown",
    columnId: "status",
    label: "Status",
    options: [
      { label: "In Stock", value: "in_stock" },
      { label: "Out of Stock", value: "out_of_stock" },
      { label: "Low Stock", value: "low_stock" },
    ],
  },
];

const actionButtons: ActionButton[] = [
  {
    label: "Add Product",
    icon: <HugeiconsIcon icon={PlusSignIcon} className="mr-2 size-4" />,
    onClick: () => console.log("Add product"),
  },
];

export function ProductsClient({ data }: { data: Product[] }) {
  return (
    <DataTable columns={columns} data={data} filters={filters} actionButtons={actionButtons} />
  );
}
