"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { DataTable, type FilterConfig } from "@/components/ui/data-table";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge
        variant={
          row.getValue("role") === "admin" || row.getValue("role") === "superadmin"
            ? "default"
            : "secondary"
        }
      >
        {row.getValue("role")}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "active" ? "default" : status === "inactive" ? "secondary" : "destructive"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "joinedAt",
    header: "Joined",
    cell: ({ row }) => format(new Date(row.getValue("joinedAt")), "MMM d, yyyy"),
  },
];

const filters: FilterConfig[] = [
  {
    type: "search",
    placeholder: "Search users...",
    searchColumns: ["name", "email"],
  },
  {
    type: "single-dropdown",
    columnId: "role",
    label: "Role",
    options: [
      { label: "Admin", value: "admin" },
      { label: "User", value: "user" },
      { label: "Superadmin", value: "superadmin" },
    ],
  },
];

export function UsersClient({ data }: { data: User[] }) {
  return <DataTable columns={columns} data={data} filters={filters} />;
}
