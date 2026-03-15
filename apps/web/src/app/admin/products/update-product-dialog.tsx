"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
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
import { UpdateImagePicker } from "@/components/ui/image-picker";
import { Input } from "@/components/ui/input";
import { cancelToastEl } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { getCategories, type ProductRow, updateProduct } from "@/features/admin/queries";
import { queryKeys } from "@/lib/query-keys";

interface UpdateProductDialogProps {
  product: ProductRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateProductDialog({ product, open, onOpenChange }: UpdateProductDialogProps) {
  const queryClient = useQueryClient();
  const anchorRef = useComboboxAnchor();

  // Track which existing images to keep and which new files to add
  const [keepImages, setKeepImages] = useState(product.images);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.adminCategories({ page: 1, limit: 200 }),
    queryFn: () => getCategories({ page: 1, limit: 200 }),
    enabled: open,
  });

  const categories = useMemo(() => categoriesData?.categories ?? [], [categoriesData?.categories]);

  const getSelectedCategories = (categoryIds: string[]) => {
    return categories.filter((c) => categoryIds.includes(c.id));
  };

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: async () => {
      toast.success("Product updated successfully", cancelToastEl);
      onOpenChange(false);
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminProducts() });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update product.", cancelToastEl);
    },
  });

  const form = useForm({
    defaultValues: {
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      stockQuantity: String(product.stockQuantity ?? 0),
      sizes: (product.sizes ?? []) as { name: string; inStock: boolean }[],
      colors: (product.colors ?? []) as { name: string; inStock: boolean }[],
      categoryIds: product.categories.map((c) => c.id),
    },
    onSubmit: async ({ value }) => {
      const totalImages = keepImages.length + newFiles.length;
      if (totalImages < 1) {
        toast.error("At least 1 image is required", cancelToastEl);
        return;
      }
      if (totalImages > 3) {
        toast.error("Maximum 3 images allowed", cancelToastEl);
        return;
      }

      await updateMutation.mutateAsync({
        id: product.id,
        input: {
          name: value.name,
          description: value.description || undefined,
          price: Number(value.price).toFixed(2),
          stockQuantity: value.stockQuantity,
          sizes: value.sizes,
          colors: value.colors,
          categoryIds: value.categoryIds,
          keepImageKeys: keepImages.map((img) => img.key),
          newImages: newFiles.length > 0 ? newFiles : undefined,
        },
      });
    },
  });

  const handleExistingRemove = useCallback((key: string) => {
    setKeepImages((prev) => prev.filter((img) => img.key !== key));
  }, []);

  const resetState = useCallback(() => {
    form.reset();
    setKeepImages(product.images);
    setNewFiles([]);
  }, [form, product.images]);

  const imageError = (() => {
    const total = keepImages.length + newFiles.length;
    if (total === 0) return "At least 1 image is required";
    if (total > 3) return "Maximum 3 images allowed";
    return undefined;
  })();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetState();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update product</DialogTitle>
          <DialogDescription>
            Edit product details. You can keep, remove, or add new images.
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
                      disabled={updateMutation.isPending}
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
                      disabled={updateMutation.isPending}
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
                        disabled={updateMutation.isPending}
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
                        disabled={updateMutation.isPending}
                        className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                      )}
                    </Field>
                  )}
                </form.Field>
              </div>

              {/* Sizes */}
              <form.Field name="sizes">
                {(field) => (
                  <Field>
                    <FieldLabel>
                      Sizes <span className="font-normal text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <div className="flex flex-col gap-2">
                      {field.state.value.map((size, index) => (
                        <ButtonGroup key={index} className="w-full">
                          <Input
                            value={size.name}
                            onChange={(e) => {
                              const next = [...field.state.value];
                              next[index] = { ...next[index], name: e.target.value };
                              field.handleChange(next);
                            }}
                            placeholder="e.g. S, M, L"
                            disabled={updateMutation.isPending}
                          />
                          <Button
                            type="button"
                            variant={size.inStock ? "default" : "outline"}
                            className="shrink-0"
                            disabled={updateMutation.isPending}
                            onClick={() => {
                              const next = [...field.state.value];
                              next[index] = { ...next[index], inStock: !next[index].inStock };
                              field.handleChange(next);
                            }}
                          >
                            <Checkbox checked={size.inStock} className="pointer-events-none" />
                            In stock
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            disabled={updateMutation.isPending}
                            onClick={() =>
                              field.handleChange(field.state.value.filter((_, i) => i !== index))
                            }
                          >
                            <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                          </Button>
                        </ButtonGroup>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="self-start"
                        disabled={
                          updateMutation.isPending ||
                          (field.state.value.length > 0 &&
                            !field.state.value[field.state.value.length - 1].name.trim())
                        }
                        onClick={() =>
                          field.handleChange([...field.state.value, { name: "", inStock: true }])
                        }
                      >
                        Add size
                      </Button>
                    </div>
                  </Field>
                )}
              </form.Field>

              {/* Colors */}
              <form.Field name="colors">
                {(field) => (
                  <Field>
                    <FieldLabel>
                      Colors <span className="font-normal text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <div className="flex flex-col gap-2">
                      {field.state.value.map((color, index) => (
                        <ButtonGroup key={index} className="w-full">
                          <Input
                            value={color.name}
                            onChange={(e) => {
                              const next = [...field.state.value];
                              next[index] = { ...next[index], name: e.target.value };
                              field.handleChange(next);
                            }}
                            placeholder="e.g. Red, Blue"
                            disabled={updateMutation.isPending}
                          />
                          <Button
                            type="button"
                            variant={color.inStock ? "default" : "outline"}
                            className="shrink-0"
                            disabled={updateMutation.isPending}
                            onClick={() => {
                              const next = [...field.state.value];
                              next[index] = { ...next[index], inStock: !next[index].inStock };
                              field.handleChange(next);
                            }}
                          >
                            <Checkbox checked={color.inStock} className="pointer-events-none" />
                            In stock
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            disabled={updateMutation.isPending}
                            onClick={() =>
                              field.handleChange(field.state.value.filter((_, i) => i !== index))
                            }
                          >
                            <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                          </Button>
                        </ButtonGroup>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="self-start"
                        disabled={
                          updateMutation.isPending ||
                          (field.state.value.length > 0 &&
                            !field.state.value[field.state.value.length - 1].name.trim())
                        }
                        onClick={() =>
                          field.handleChange([...field.state.value, { name: "", inStock: true }])
                        }
                      >
                        Add color
                      </Button>
                    </div>
                  </Field>
                )}
              </form.Field>

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
                            disabled={updateMutation.isPending}
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
              <Field data-invalid={imageError ? true : undefined}>
                <FieldLabel>Product images</FieldLabel>
                <UpdateImagePicker
                  existingImages={keepImages}
                  newFiles={newFiles}
                  onExistingRemove={handleExistingRemove}
                  onNewFilesChange={setNewFiles}
                  maxFiles={3}
                  disabled={updateMutation.isPending}
                  error={imageError}
                />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={updateMutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || updateMutation.isPending || !!imageError}
                >
                  {isSubmitting || updateMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
