"use client";

import { MoreVerticalCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cancelToastEl } from "@/components/ui/sonner";
import {
  deleteCategory,
  updateCategory,
  type AdminCategoryRow,
} from "@/features/admin/queries";
import { queryKeys } from "@/lib/query-keys";
import { getApiError } from "@/lib/utils";

interface CategoryRowActionsProps {
  category: AdminCategoryRow;
}

type ActionType = "update" | "delete";

export const CategoryRowActions = ({ category }: CategoryRowActionsProps) => {
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

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: async () => {
      toast.success("Category updated successfully", cancelToastEl);
      closeDialog();
      updateForm.reset();
      await queryClient.invalidateQueries({
        queryKey: queryKeys.adminCategories(),
      });
    },
    onError: (err) => {
      toast.error(
        getApiError(err) || "Failed to update category.",
        cancelToastEl,
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      toast.success("Category deleted successfully", cancelToastEl);
      closeDialog();
      await queryClient.invalidateQueries({
        queryKey: queryKeys.adminCategories(),
      });
    },
    onError: (err) => {
      toast.error(
        getApiError(err) || "Failed to delete category.",
        cancelToastEl,
      );
    },
  });

  const updateForm = useForm({
    defaultValues: {
      name: category.name,
    },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({ id: category.id, body: value });
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
              aria-label={`Options for ${category.name}`}
            >
              <HugeiconsIcon
                icon={MoreVerticalCircle01Icon}
                className="size-4"
              />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openAction("update")}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => openAction("delete")}
            variant="destructive"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Update dialog */}
      <Dialog
        open={openDialog && pendingAction === "update"}
        onOpenChange={(next) => {
          if (!next) {
            closeDialog();
            updateForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update category</DialogTitle>
            <DialogDescription>
              Edit the category name. The slug will be regenerated
              automatically.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await updateForm.handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            <FieldGroup>
              <updateForm.Field
                name="name"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return "Name is required";
                    if (value.length < 1)
                      return "Name must be at least 1 character";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.errors.length > 0 ? true : undefined
                    }
                  >
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Electronics"
                      aria-invalid={field.state.meta.errors.length > 0}
                      disabled={updateMutation.isPending}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {field.state.meta.errors.join(", ")}
                      </FieldError>
                    )}
                  </Field>
                )}
              </updateForm.Field>
            </FieldGroup>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={updateMutation.isPending}
                onClick={closeDialog}
              >
                Cancel
              </Button>
              <updateForm.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={
                      !canSubmit || isSubmitting || updateMutation.isPending
                    }
                  >
                    {isSubmitting || updateMutation.isPending
                      ? "Saving..."
                      : "Save changes"}
                  </Button>
                )}
              </updateForm.Subscribe>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={openDialog && pendingAction === "delete"}
        onOpenChange={(next) => {
          if (!next) closeDialog();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-secondary-foreground">
                {category.name}
              </span>
              ? This action cannot be undone. Categories with associated
              products cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                deleteMutation.mutate(category.id);
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
