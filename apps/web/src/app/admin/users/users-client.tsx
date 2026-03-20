"use client";

import { UserAdd01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { format } from "date-fns";
import { useState } from "react";

import { User } from "@repo/db/schemas/auth.schema";

import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type ActionButton,
  type FilterConfig,
} from "@/components/ui/data-table";
import {
  defaultAdminUsersListParams,
  getAdminUsers,
  type AdminUserRow,
} from "@/features/admin/queries";
import { getUser } from "@/features/user/queries";
import { queryKeys } from "@/lib/query-keys";
import { roles } from "@/lib/utils";

import { CreateUserDialog } from "./create-user-dialog";
import { UserDetailDialog } from "./user-detail-dialog";
import { UserRowActions } from "./user-row-actions";

type UserRow = AdminUserRow;

const roleSortRank: Record<string, number> = {
  superadmin: 0,
  admin: 1,
  user: 2,
};

const statusSortRank: Record<string, number> = {
  active: 0,
  banned: 1,
};

const byName = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: "base" });

const columns = (currentUser: User): ColumnDef<UserRow>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    filterFn: (row, columnId, filterValue) => {
      const role = row.getValue(columnId) ?? roles.USER;

      if (!Array.isArray(filterValue)) {
        return role === filterValue;
      }

      if (filterValue.length === 0) {
        return true;
      }

      return filterValue.includes(role);
    },
    sortingFn: (rowA, rowB) => {
      const leftRank =
        roleSortRank[rowA.original.role ?? roles.USER] ??
        Number.MAX_SAFE_INTEGER;
      const rightRank =
        roleSortRank[rowB.original.role ?? roles.USER] ??
        Number.MAX_SAFE_INTEGER;

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      return byName(rowA.original.name, rowB.original.name);
    },
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.role === roles.ADMIN ||
          row.original.role === roles.SUPERADMIN
            ? "default"
            : "secondary"
        }
      >
        {row.original.role}
      </Badge>
    ),
  },
  {
    id: "status",
    accessorFn: (row) => (row.banned ? "banned" : "active"),
    header: "Status",
    filterFn: (row, columnId, filterValue) => {
      const status = row.getValue(columnId);

      if (!Array.isArray(filterValue)) {
        return status === filterValue;
      }

      if (filterValue.length === 0) {
        return true;
      }

      return filterValue.includes(status);
    },
    sortingFn: (rowA, rowB) => {
      const statusA = rowA.getValue("status");
      const statusB = rowB.getValue("status");

      const leftRank = statusSortRank[statusA] ?? Number.MAX_SAFE_INTEGER;
      const rightRank = statusSortRank[statusB] ?? Number.MAX_SAFE_INTEGER;

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      return byName(rowA.original.name, rowB.original.name);
    },
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <Badge
          variant={
            status === "active"
              ? "default"
              : status === "banned"
                ? "destructive"
                : "secondary"
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
    cell: ({ row }) => format(row.original.createdAt, "MMM d, yyyy"),
  },
  {
    id: "options",
    header: "",
    enableSorting: false,
    cell: ({ row }) => {
      const user = row.original;

      return user && currentUser ? (
        <UserRowActions user={user} currentUser={currentUser} />
      ) : null;
    },
  },
];

const filters: FilterConfig[] = [
  {
    type: "search",
    placeholder: "Search users...",
    searchColumns: ["name", "email"],
  },
  {
    type: "multi-dropdown",
    label: "Filters",
    groups: [
      {
        columnId: "role",
        label: "Role",
        options: [
          { label: "Admin", value: "admin" },
          { label: "User", value: "user" },
          { label: "Superadmin", value: "superadmin" },
        ],
      },
      {
        columnId: "status",
        label: "Status",
        options: [
          { label: "Active", value: "active" },
          { label: "Banned", value: "banned" },
        ],
      },
    ],
  },
];

export const UsersClient = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 100,
  });
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: queryKeys.user(),
    queryFn: () => getUser(),
  });

  const queryParams = {
    ...defaultAdminUsersListParams,
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminUsers(queryParams),
    queryFn: () => getAdminUsers(queryParams),
    placeholderData: keepPreviousData,
  });

  const tableData = data?.users ?? ([] as const);

  const currentSelectedUser = selectedUser
    ? (tableData.find((u) => u.id === selectedUser.id) ?? selectedUser)
    : null;

  if (!user) return null;

  const actionButtons: ActionButton[] = [
    {
      label: "New User",
      icon: <HugeiconsIcon icon={UserAdd01Icon} className="size-4" />,
      onClick: () => setCreateOpen(true),
      hideLabelOnMobile: true,
    },
  ] as const;

  return (
    <>
      <DataTable
        columns={columns(user)}
        data={tableData}
        emptyMessage={isLoading ? "Loading users..." : "No users found."}
        filters={filters}
        actionButtons={actionButtons}
        rowCount={data?.total}
        pagination={pagination}
        onPaginationChange={setPagination}
        onRowClick={(row) => setSelectedUser(row)}
      />
      <UserDetailDialog
        user={currentSelectedUser}
        currentUser={user}
        open={selectedUser !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
      />
      <CreateUserDialog
        currentUser={user}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  );
};
