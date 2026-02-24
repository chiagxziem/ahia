import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Sign up for an Ahia account to start shopping.",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="flex items-center gap-2 self-center font-medium">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <span className="font-bold">A</span>
        </div>
        <span className="text-xl tracking-tight">Ahia</span>
      </Link>
      <RegisterForm />
    </div>
  );
}
