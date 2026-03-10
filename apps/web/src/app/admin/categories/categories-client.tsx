"use client";

import { Edit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { format } from "date-fns";
import { useState } from "react";

import { type ActionButton, DataTable, type FilterConfig } from "@/components/ui/data-table";
import {
  type CategoryRow,
  defaultCategoriesListParams,
  getCategories,
} from "@/features/admin/queries";
import { queryKeys } from "@/lib/query-keys";

import { CategoryRowActions } from "./category-row-actions";
import { CreateCategoryDialog } from "./create-category-dialog";

const columns: ColumnDef<CategoryRow>[] = [
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
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => format(row.original.createdAt, "MMM d, yyyy"),
  },
  {
    id: "options",
    header: "",
    enableSorting: false,
    cell: ({ row }) => <CategoryRowActions category={row.original} />,
  },
];

const filters: FilterConfig[] = [
  {
    type: "search",
    placeholder: "Search categories...",
    searchColumns: ["name", "slug"],
  },
];

export const CategoriesClient = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultCategoriesListParams.limit!,
  });

  const queryParams = {
    ...defaultCategoriesListParams,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminCategories(queryParams),
    queryFn: () => getCategories(queryParams),
    placeholderData: keepPreviousData,
  });

  const tableData = data?.categories ?? ([] as const);

  const actionButtons: ActionButton[] = [
    {
      label: "New Category",
      icon: <HugeiconsIcon icon={Edit01Icon} className="size-4" />,
      onClick: () => setCreateOpen(true),
    },
  ] as const;

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        emptyMessage={isLoading ? "Loading categories..." : "No categories found."}
        filters={filters}
        actionButtons={actionButtons}
        rowCount={data?.total}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
      <CreateCategoryDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
};
