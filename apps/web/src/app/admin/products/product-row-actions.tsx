"use client";

import { MoreVerticalCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cancelToastEl } from "@/components/ui/sonner";
import { deleteProduct, type AdminProductRow } from "@/features/admin/queries";
import { queryKeys } from "@/lib/query-keys";

import { UpdateProductDialog } from "./update-product-dialog";

interface ProductRowActionsProps {
  product: AdminProductRow;
}

type ActionType = "update" | "delete";

export const ProductRowActions = ({ product }: ProductRowActionsProps) => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);

  const openAction = (action: ActionType) => {
    setPendingAction(action);
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setPendingAction(null);
  };

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      toast.success("Product deleted successfully", cancelToastEl);
      closeDialog();
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminProducts() });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete product.", cancelToastEl);
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label={`Options for ${product.name}`}
            >
              <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuItem
            render={
              <Link href={`/products/${product.id}`} target="_blank" rel="noopener noreferrer" />
            }
          >
            Visit product page
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openAction("update")}>Update product</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => openAction("delete")} variant="destructive">
            Delete product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Update dialog */}
      <UpdateProductDialog
        product={product}
        open={openDialog && pendingAction === "update"}
        onOpenChange={(next) => {
          if (!next) closeDialog();
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={openDialog && pendingAction === "delete"}
        onOpenChange={(next) => {
          if (!next) closeDialog();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-secondary-foreground">{product.name}</span>? This
              action cannot be undone. Products with existing cart items or orders cannot be
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                deleteMutation.mutate(product.id);
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
