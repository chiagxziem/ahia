"use client";

import { Download01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { type ActionButton, DataTable, type FilterConfig } from "@/components/ui/data-table";

type Order = {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: string;
};

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => format(new Date(row.getValue("date")), "MMM d, yyyy h:mm a"),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const labels: Record<string, string> = {
        pending: "Pending",
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered",
      };
      const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
        pending: "secondary",
        processing: "default",
        shipped: "outline",
        delivered: "default", // Success color typically
      };

      return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
    },
  },
];

const filters: FilterConfig[] = [
  {
    type: "search",
    placeholder: "Search orders...",
    searchColumns: ["id", "customer"],
  },
  {
    type: "single-dropdown",
    columnId: "status",
    label: "Status",
    options: [
      { label: "Pending", value: "pending" },
      { label: "Processing", value: "processing" },
      { label: "Shipped", value: "shipped" },
      { label: "Delivered", value: "delivered" },
    ],
  },
];

const actionButtons: ActionButton[] = [
  {
    label: "Export",
    icon: <HugeiconsIcon icon={Download01Icon} className="mr-2 size-4" />,
    onClick: () => console.log("Export orders"),
    variant: "outline",
  },
];

export const OrdersClient = ({ data }: { data: Order[] }) => {
  return (
    <DataTable columns={columns} data={data} filters={filters} actionButtons={actionButtons} />
  );
};
