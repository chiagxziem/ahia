"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cancelToastEl } from "@/components/ui/sonner";
import { createAdminUser } from "@/features/admin/queries";
import { queryKeys } from "@/lib/query-keys";
import { roles } from "@/lib/utils";
import type { User } from "@repo/db/schemas/auth.schema";

interface CreateUserDialogProps {
  currentUser: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({ currentUser, open, onOpenChange }: CreateUserDialogProps) {
  const queryClient = useQueryClient();
  const isSuperadmin = currentUser.role === roles.SUPERADMIN;

  const createMutation = useMutation({
    mutationFn: createAdminUser,
    onSuccess: async () => {
      toast.success("User created successfully", cancelToastEl);
      onOpenChange(false);
      form.reset();
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create user. Please try again.", cancelToastEl);
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      role: "user" as "user" | "admin",
    },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync(value);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new user</DialogTitle>
          <DialogDescription>
            A password will be generated and emailed to the new user along with a verification link.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            {/* Name */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return "Name is required";
                  if (value.length < 2) return "Name must be at least 2 characters";
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
                    placeholder="John Doe"
                    disabled={createMutation.isPending}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                  )}
                </Field>
              )}
            </form.Field>

            {/* Email */}
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return "Email is required";
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                    return "Please enter a valid email";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0 ? true : undefined}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="john@example.com"
                    disabled={createMutation.isPending}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                  )}
                </Field>
              )}
            </form.Field>

            {/* Role */}
            <form.Field name="role">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as "user" | "admin")}
                    disabled={!isSuperadmin || createMutation.isPending}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>
          </FieldGroup>

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
                  {isSubmitting || createMutation.isPending ? "Creating..." : "Create user"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
