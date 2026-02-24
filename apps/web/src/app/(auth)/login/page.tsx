import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Ahia account.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="flex items-center gap-2 self-center font-medium">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <span className="font-bold">A</span>
        </div>
        <span className="text-xl tracking-tight">Ahia</span>
      </Link>
      <LoginForm />
    </div>
  );
}
