"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
        <p className="text-sm text-muted-foreground">Must be at least 8 characters</p>
      </div>

      {/* Form */}
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <Input id="password" type="password" required className="h-11 rounded-xl" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-password" className="text-sm font-medium">
            Confirm password
          </Label>
          <Input id="confirm-password" type="password" required className="h-11 rounded-xl" />
        </div>

        <Button type="submit" className="mt-1 h-11 w-full rounded-xl text-sm font-semibold">
          Reset password
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-foreground transition-colors hover:text-primary"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
