import type { Metadata } from "next";

import { UserSettings } from "@/components/storefront/user-settings";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
};

export default function SettingsPage() {
  return (
    <div className="small-container mx-auto px-4 py-12 md:py-20">
      <div className="flex flex-col gap-10">
        {/* Page header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
        </div>

        <UserSettings />
      </div>
    </div>
  );
}
