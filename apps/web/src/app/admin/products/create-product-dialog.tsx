"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ImagePicker } from "@/components/ui/image-picker";
import { Input } from "@/components/ui/input";
import { cancelToastEl } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, getCategories } from "@/features/admin/queries";
import { getUser } from "@/features/user/queries";
import { queryKeys } from "@/lib/query-keys";

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductDialog({ open, onOpenChange }: CreateProductDialogProps) {
  const queryClient = useQueryClient();
  const anchorRef = useComboboxAnchor();

  const { data: user } = useQuery({
    queryKey: queryKeys.user(),
    queryFn: () => getUser(),
  });

  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.adminCategories({ page: 1, limit: 200 }),
    queryFn: () => getCategories({ page: 1, limit: 200 }),
    enabled: open,
  });

  const categories = useMemo(() => categoriesData?.categories ?? [], [categoriesData?.categories]);

  const getSelectedCategories = (categoryIds: string[]) => {
    return categories.filter((c) => categoryIds.includes(c.id));
  };

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      toast.success("Product created successfully", cancelToastEl);
      onOpenChange(false);
      form.reset();
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminProducts() });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create product.", cancelToastEl);
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stockQuantity: "",
      categoryIds: [] as string[],
      images: [] as File[],
    },
    onSubmit: async ({ value }) => {
      if (!user) return;
      await createMutation.mutateAsync({
        name: value.name,
        description: value.description || undefined,
        price: Number(value.price).toFixed(2),
        stockQuantity: value.stockQuantity,
        categoryIds: value.categoryIds,
        images: value.images,
        createdBy: user.id,
      });
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create new product</DialogTitle>
          <DialogDescription>
            Fill in the product details. Images, name, price, stock and at least one category are
            required.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col"
        >
          <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4 pb-4">
            <FieldGroup>
              {/* Name */}
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return "Name is required";
                    if (value.length < 1) return "Name must be at least 1 character";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0 ? true : undefined}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Wireless Headphones"
                      aria-invalid={field.state.meta.errors.length > 0}
                      disabled={createMutation.isPending}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                    )}
                  </Field>
                )}
              </form.Field>

              {/* Description */}
              <form.Field name="description">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Description{" "}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Describe the product..."
                      disabled={createMutation.isPending}
                      className="resize-none"
                    />
                  </Field>
                )}
              </form.Field>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-3">
                <form.Field
                  name="price"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value) return "Price is required";
                      const num = Number(value);
                      if (Number.isNaN(num) || num <= 0) return "Price must be a positive number";
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0 ? true : undefined}>
                      <FieldLabel htmlFor={field.name}>Price ($)</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="0.00"
                        aria-invalid={field.state.meta.errors.length > 0}
                        disabled={createMutation.isPending}
                        className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                      )}
                    </Field>
                  )}
                </form.Field>

                <form.Field
                  name="stockQuantity"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value && value !== "0") return "Stock is required";
                      const num = Number(value);
                      if (Number.isNaN(num) || num < 0 || !Number.isInteger(num))
                        return "Must be a non-negative integer";
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0 ? true : undefined}>
                      <FieldLabel htmlFor={field.name}>Stock quantity</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        step="1"
                        min="0"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="0"
                        aria-invalid={field.state.meta.errors.length > 0}
                        disabled={createMutation.isPending}
                        className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                      )}
                    </Field>
                  )}
                </form.Field>
              </div>

              {/* Categories */}
              <form.Field
                name="categoryIds"
                validators={{
                  onChange: ({ value }) => {
                    if (!value || value.length === 0) return "At least one category is required";
                    return undefined;
                  },
                }}
              >
                {(field) => {
                  const selectedCategories = getSelectedCategories(field.state.value);
                  return (
                    <Field data-invalid={field.state.meta.errors.length > 0 ? true : undefined}>
                      <FieldLabel>Categories</FieldLabel>
                      <Combobox
                        items={categories}
                        multiple
                        value={selectedCategories}
                        onValueChange={(val) => {
                          field.handleChange(val.map((c) => c.id));
                        }}
                        itemToStringValue={(c) => c.name}
                        isItemEqualToValue={(a, b) => a.id === b.id}
                      >
                        <ComboboxChips ref={anchorRef}>
                          <ComboboxValue>
                            {selectedCategories.map((cat) => (
                              <ComboboxChip key={cat.id}>{cat.name}</ComboboxChip>
                            ))}
                          </ComboboxValue>
                          <ComboboxChipsInput
                            placeholder={
                              field.state.value.length === 0 ? "Search categories..." : ""
                            }
                            disabled={createMutation.isPending}
                            aria-invalid={field.state.meta.errors.length > 0}
                          />
                        </ComboboxChips>
                        <ComboboxContent anchor={anchorRef}>
                          <ComboboxList>
                            {categories.map((cat) => (
                              <ComboboxItem key={cat.id} value={cat}>
                                {cat.name}
                              </ComboboxItem>
                            ))}
                          </ComboboxList>
                          <ComboboxEmpty>No categories found.</ComboboxEmpty>
                        </ComboboxContent>
                      </Combobox>
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              {/* Images */}
              <form.Field
                name="images"
                validators={{
                  onChange: ({ value }) => {
                    if (!value || value.length === 0) return "At least 1 image is required";
                    if (value.length > 3) return "Maximum 3 images allowed";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0 ? true : undefined}>
                    <FieldLabel>Product images</FieldLabel>
                    <ImagePicker
                      value={field.state.value}
                      onChange={(files) => field.handleChange(files)}
                      maxFiles={3}
                      disabled={createMutation.isPending}
                      error={
                        field.state.meta.errors.length > 0
                          ? field.state.meta.errors.join(", ")
                          : undefined
                      }
                    />
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={createMutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || createMutation.isPending}
                >
                  {isSubmitting || createMutation.isPending ? "Creating..." : "Create product"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
