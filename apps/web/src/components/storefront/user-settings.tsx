"use client";

import { Facehash } from "facehash";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DUMMY_USER } from "@/lib/dummy-user";
import { getInitials } from "@/lib/utils";

export function UserSettings() {
  const user = DUMMY_USER;

  return (
    <>
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
            {!user.image ? (
              <Facehash
                name={user.name}
                size={48}
                variant="solid"
                intensity3d="medium"
                enableBlink
                className="rounded-xl border bg-muted text-muted-foreground"
              />
            ) : (
              <Avatar size="xl" className={"rounded-xl after:rounded-xl"}>
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="rounded-xl text-[10px] font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Image */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="image" className="text-sm font-medium">
              Image URL
            </Label>
            <Input
              id="image"
              type="text"
              defaultValue={user.image}
              className="h-10 max-w-sm rounded-xl"
            />
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
              className="h-10 max-w-sm rounded-xl"
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
              className="h-10 max-w-sm rounded-xl"
            />
            <p className="text-[11px] text-muted-foreground">
              Email cannot be changed. Contact support if you need help.
            </p>
          </div>

          <div>
            <Button type="submit" className="rounded-full px-6 text-xs font-semibold">
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
              <Input id="current-password" type="password" className="h-10 max-w-sm rounded-xl" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                New password
              </Label>
              <Input id="new-password" type="password" className="h-10 max-w-sm rounded-xl" />
              <p className="text-[11px] text-muted-foreground">Must be at least 8 characters.</p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-new-password" className="text-sm font-medium">
                Confirm new password
              </Label>
              <Input
                id="confirm-new-password"
                type="password"
                className="h-10 max-w-sm rounded-xl"
              />
            </div>

            <div>
              <Button type="submit" className="rounded-full px-6 text-xs font-semibold">
                Update password
              </Button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
