import type { Metadata } from "next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
};

// Dummy user data — replace with real auth data later
const DUMMY_USER = {
  name: "Jane Doe",
  email: "jane@example.com",
  image: "",
  isAdmin: true,
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function SettingsPage() {
  const user = DUMMY_USER;

  return (
    <div className="w-full max-w-200 mx-auto px-4 py-12 md:py-20">
      <div className="flex flex-col gap-10">
        {/* Page header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
        </div>

        {/* Profile section */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold tracking-tight">Profile</h2>
            <p className="text-sm text-muted-foreground">Update your personal information.</p>
          </div>

          <div className="h-px bg-border/30" />

          <form className="flex flex-col gap-6">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <Avatar size="lg">
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="text-sm font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs font-medium"
                >
                  Change photo
                </Button>
                <p className="text-[11px] text-muted-foreground">JPG, PNG or WebP. 1MB max.</p>
              </div>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                defaultValue={user.name}
                className="h-10 rounded-xl max-w-sm"
              />
            </div>

            {/* Email — read only */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                defaultValue={user.email}
                disabled
                className="h-10 rounded-xl max-w-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Email cannot be changed. Contact support if you need help.
              </p>
            </div>

            <div>
              <Button type="submit" className="rounded-full text-xs font-semibold px-6">
                Save changes
              </Button>
            </div>
          </form>
        </section>

        {/* Password section — Admin only */}
        {user.isAdmin && (
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold tracking-tight">Password</h2>
              <p className="text-sm text-muted-foreground">Update your admin account password.</p>
            </div>

            <div className="h-px bg-border/30" />

            <form className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="current-password" className="text-sm font-medium">
                  Current password
                </Label>
                <Input id="current-password" type="password" className="h-10 rounded-xl max-w-sm" />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="new-password" className="text-sm font-medium">
                  New password
                </Label>
                <Input id="new-password" type="password" className="h-10 rounded-xl max-w-sm" />
                <p className="text-[11px] text-muted-foreground">Must be at least 8 characters.</p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm-new-password" className="text-sm font-medium">
                  Confirm new password
                </Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  className="h-10 rounded-xl max-w-sm"
                />
              </div>

              <div>
                <Button type="submit" className="rounded-full text-xs font-semibold px-6">
                  Update password
                </Button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
