"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cancelToastEl } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";
import env from "@/lib/env";

export function ForgotPasswordForm() {
  const [isPending, setIsPending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.requestPasswordReset(
        {
          email: value.email,
          redirectTo: `${env.NEXT_PUBLIC_WEB_URL}/reset-password`,
        },
        {
          onRequest() {
            setIsPending(true);
          },
          onSuccess: () => {
            setIsPending(false);
            setIsSubmitted(true);
            toast.success("Password reset link sent to your email", cancelToastEl);
          },
          onError(ctx) {
            setIsPending(false);
            toast.error(
              ctx.error.message || "An error occurred while sending the reset link",
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

  if (isSubmitted) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to your email address.
          </p>
        </div>
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

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
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
            name="email"
            validators={{
              onChange: ({ value }) => {
                const res = z.email("Please enter a valid email address").safeParse(value);
                return res.success ? undefined : res.error.issues[0]?.message;
              },
            }}
          >
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0 ? true : undefined}>
                <FieldLabel htmlFor={field.name} className="text-sm font-medium">
                  Email
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
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
              {isSubmitting || isPending ? "Sending..." : "Send reset link"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
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
