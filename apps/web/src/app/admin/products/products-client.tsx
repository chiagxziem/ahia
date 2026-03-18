"use client";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { format } from "date-fns";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { DataTable, type ActionButton, type FilterConfig } from "@/components/ui/data-table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  defaultAdminProductsListParams,
  getAdminProducts,
  type AdminProductRow,
} from "@/features/admin/queries";
import { queryKeys } from "@/lib/query-keys";
import { formatCurrency } from "@/lib/utils";

import { CreateProductDialog } from "./create-product-dialog";
import { ProductDetailDialog } from "./product-detail-dialog";
import { ProductRowActions } from "./product-row-actions";

const LOW_STOCK_THRESHOLD = 10;

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

const getStockStatus = (qty: number | null): StockStatus => {
  if (!qty || qty <= 0) return "out_of_stock";
  if (qty <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
};

const stockStatusLabel: Record<StockStatus, string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

const stockStatusVariant: Record<StockStatus, "default" | "secondary" | "destructive"> = {
  in_stock: "default",
  low_stock: "secondary",
  out_of_stock: "destructive",
};

const CategoryCell = ({ categories }: { categories: AdminProductRow["categories"] }) => {
  if (categories.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (categories.length === 1) {
    return <Badge variant="outline">{categories[0].name}</Badge>;
  }

  const remaining = categories.slice(1);

  return (
    <div className="flex items-center gap-1">
      <Badge variant="outline">{categories[0].name}</Badge>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" className="cursor-default">
              +{remaining.length}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-col gap-0.5">
              {remaining.map((c) => (
                <span key={c.id}>{c.name}</span>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

const columns: ColumnDef<AdminProductRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    id: "categories",
    header: "Category",
    accessorFn: (row) => row.categories.map((c) => c.name).join(", "),
    cell: ({ row }) => <CategoryCell categories={row.original.categories} />,
  },
  {
    accessorKey: "price",
    header: "Price",
    enableSorting: true,
    sortingFn: (a, b) => Number(a.original.price) - Number(b.original.price),
    cell: ({ row }) => (
      <div className="font-medium">{formatCurrency(Number(row.original.price))}</div>
    ),
  },
  {
    accessorKey: "stockQuantity",
    header: "Stock",
    enableSorting: true,
    cell: ({ row }) => row.original.stockQuantity ?? 0,
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => getStockStatus(row.stockQuantity),
    filterFn: (row, _columnId, filterValue) => {
      const status = getStockStatus(row.original.stockQuantity);
      if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
      return filterValue.includes(status);
    },
    cell: ({ row }) => {
      const status = getStockStatus(row.original.stockQuantity);
      return <Badge variant={stockStatusVariant[status]}>{stockStatusLabel[status]}</Badge>;
    },
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
    cell: ({ row }) => <ProductRowActions product={row.original} />,
  },
];

const filters: FilterConfig[] = [
  {
    type: "search",
    placeholder: "Search products...",
    searchColumns: ["name", "categories"],
  },
  {
    type: "multi-dropdown",
    label: "Filters",
    groups: [
      {
        columnId: "status",
        label: "Stock Status",
        options: [
          { label: "In Stock", value: "in_stock" },
          { label: "Low Stock", value: "low_stock" },
          { label: "Out of Stock", value: "out_of_stock" },
        ],
      },
    ],
  },
];

export const ProductsClient = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<AdminProductRow | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultAdminProductsListParams.limit!,
  });

  const queryParams = {
    ...defaultAdminProductsListParams,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminProducts(queryParams),
    queryFn: () => getAdminProducts(queryParams),
    placeholderData: keepPreviousData,
  });

  const tableData = data?.products ?? ([] as const);

  const currentDetailProduct = detailProduct
    ? (tableData.find((p) => p.id === detailProduct.id) ?? detailProduct)
    : null;

  const actionButtons: ActionButton[] = [
    {
      label: "Add Product",
      icon: <HugeiconsIcon icon={PlusSignIcon} className="size-4" />,
      onClick: () => setCreateOpen(true),
      hideLabelOnMobile: true,
    },
  ] as const;

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        emptyMessage={isLoading ? "Loading products..." : "No products found."}
        filters={filters}
        actionButtons={actionButtons}
        rowCount={data?.total}
        pagination={pagination}
        onPaginationChange={setPagination}
        onRowClick={(row) => setDetailProduct(row)}
      />
      <CreateProductDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ProductDetailDialog
        product={currentDetailProduct}
        open={!!detailProduct}
        onOpenChange={(next) => {
          if (!next) setDetailProduct(null);
        }}
      />
    </>
  );
};
