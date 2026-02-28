"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cancelToastEl } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [token] = useQueryState("token", { defaultValue: "" });

  const [isPending, setIsPending] = useState(false);

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      if (value.password !== value.confirmPassword) {
        toast.error("Passwords do not match", cancelToastEl);
        return;
      }

      if (!token) {
        toast.error("Invalid or expired reset link", cancelToastEl);
        return;
      }

      await authClient.resetPassword(
        {
          newPassword: value.password,
          token,
        },
        {
          onRequest() {
            setIsPending(true);
          },
          onSuccess: () => {
            setIsPending(false);
            toast.success("Password reset successfully", cancelToastEl);
            form.reset();
            router.push("/sign-in");
          },
          onError(ctx) {
            setIsPending(false);
            toast.error(
              ctx.error.message || "An error occurred while resetting password",
              cancelToastEl,
            );
          },
          onSettled() {
            setIsPending(false);
          },
        },
      );
    },
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
        <p className="text-sm text-muted-foreground">Must be at least 8 characters</p>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-5"
      >
        <FieldGroup>
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Password is required";
                if (value.length < 8) return "Password must be at least 8 characters";
                return undefined;
              },
            }}
          >
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0 ? true : undefined}>
                <FieldLabel htmlFor={field.name} className="text-sm font-medium">
                  Password
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  className="h-11 rounded-xl"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                {field.state.meta.errors.length > 0 && (
                  <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                )}
              </Field>
            )}
          </form.Field>

          <form.Field
            name="confirmPassword"
            validators={{
              onChangeListenTo: ["password"],
              onChange: ({ value, fieldApi }) => {
                if (!value) return "Please confirm your password";
                if (value !== fieldApi.form.getFieldValue("password")) {
                  return "Passwords do not match";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0 ? true : undefined}>
                <FieldLabel htmlFor={field.name} className="text-sm font-medium">
                  Confirm password
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  className="h-11 rounded-xl"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                {field.state.meta.errors.length > 0 && (
                  <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                )}
              </Field>
            )}
          </form.Field>
        </FieldGroup>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting || isPending}
              className="mt-1 h-11 w-full rounded-xl text-sm font-semibold"
            >
              {isSubmitting || isPending ? "Resetting..." : "Reset password"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/sign-in"
          className="font-medium text-foreground transition-colors hover:text-primary"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
