"use client";

import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { $fetchAndThrow } from "@/lib/fetch";
import { queryKeys } from "@/lib/query-keys";
import { successResSchema } from "@/lib/schemas";

const verifySession = async (sessionId: string) => {
  return await $fetchAndThrow("/orders/verify-session", {
    method: "POST",
    body: { sessionId },
    output: successResSchema(z.any()),
  });
};

export const CheckoutSuccess = ({ sessionId }: { sessionId: string }) => {
  const queryClient = useQueryClient();
  const verifiedRef = useRef(false);

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: verifySession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
    },
  });

  useEffect(() => {
    if (!verifiedRef.current) {
      verifiedRef.current = true;
      mutate(sessionId);
    }
  }, [sessionId, mutate]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        {isPending ? (
          <>
            <div className="size-16 animate-pulse rounded-full bg-muted" />
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Verifying your payment...
            </h1>
            <p className="text-sm text-muted-foreground">
              Please wait while we confirm your order.
            </p>
          </>
        ) : isError ? (
          <>
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <span className="text-3xl">!</span>
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Verification failed
            </h1>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t verify your payment. If you were charged, your
              order will still be processed — please check your email for
              confirmation.
            </p>
            <Button
              className="rounded-full"
              nativeButton={false}
              render={<Link href="/" />}
            >
              Back to Home
            </Button>
          </>
        ) : isSuccess ? (
          <>
            <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="size-8 text-green-600"
              />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Payment successful!
            </h1>
            <p className="text-sm text-muted-foreground">
              Thank you for your purchase. You&apos;ll receive a confirmation
              email shortly with your order details.
            </p>
            <Button
              className="rounded-full"
              nativeButton={false}
              render={<Link href="/" />}
            >
              Back to Home
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
};
