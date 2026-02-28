import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { UserSettings } from "@/components/storefront/user-settings";
import { getUser } from "@/features/user/queries";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
};

async function SettingsContent() {
  const user = await getUser(await headers());

  if (!user) {
    redirect("/sign-in");
  }

  return <UserSettings />;
}

export default function SettingsPage() {
  return (
    <div className="small-container mx-auto px-4 py-12 md:py-20">
      <div className="flex flex-col gap-10">
        {/* Page header */}
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
        </div>

        <Suspense fallback={<div className="h-100 w-full animate-pulse rounded-xl bg-muted/60" />}>
          <SettingsContent />
        </Suspense>
      </div>
    </div>
  );
}
