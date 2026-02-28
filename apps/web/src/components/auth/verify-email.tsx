"use client";

import Link from "next/link";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { cancelToastEl } from "../ui/sonner";

export function VerifyEmailContent() {
  const [token] = useQueryState("token", { defaultValue: "" });
  const [isVerified, setIsVerified] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMessage("No verification token found.");
      return;
    }

    const verifyToken = async () => {
      await authClient.verifyEmail(
        {
          query: {
            token,
          },
        },
        {
          onRequest() {
            setIsPending(true);
          },
          onSuccess: () => {
            setIsPending(false);
            setIsVerified(true);
            toast.success("Email verified successfully", cancelToastEl);
          },
          onError(ctx) {
            setIsPending(false);
            setErrorMessage(ctx.error.message || "Failed to verify email.");
            toast.error(
              ctx.error.message || "An error occurred while verifying email",
              cancelToastEl,
            );
          },
          onSettled() {
            setIsPending(false);
          },
        },
      );
    };

    verifyToken();
  }, [token]);

  if (isVerified) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Verification successful</h1>
          <p className="text-sm text-muted-foreground">
            Your email has been verified successfully.
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

  if (errorMessage) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-destructive">
            Verification failed
          </h1>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
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
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {isPending ? "Verifying your email" : "Ready to verify"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isPending
            ? "Please wait while we verify your email."
            : "Preparing to verify your email."}
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
