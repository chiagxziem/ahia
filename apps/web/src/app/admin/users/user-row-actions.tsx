"use client";

import { MoreVerticalCircle01Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Facehash } from "facehash";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cancelToastEl } from "@/components/ui/sonner";
import type { AdminUserRow } from "@/features/admin/queries";
import { queryKeys } from "@/lib/query-keys";
import { getInitials, roles } from "@/lib/utils";
import { authClient } from "@repo/auth/client";
import type { User } from "@repo/db/schemas/auth.schema";

interface UserRowActionsProps {
  user: AdminUserRow;
  currentUser: User;
}

type ActionType =
  | "set-role"
  | "set-password"
  | "ban-toggle"
  | "revoke-sessions"
  | "remove-user"
  | "update-user";

export function UserRowActions({ user, currentUser }: UserRowActionsProps) {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const canModify =
    currentUser.role === roles.SUPERADMIN ||
    (currentUser.role === roles.ADMIN && user.role === roles.USER);

  const canChangeRole = user.role !== roles.SUPERADMIN && currentUser.role === roles.SUPERADMIN;

  const handleSetRole = async (newRole: "admin" | "user") => {
    setIsLoading(true);
    try {
      const response = await authClient.admin.setRole({
        userId: user.id,
        role: newRole,
      });

      if (response.error) {
        toast.error(response.error.message || "Failed to change role. Please try again.");
        return;
      }

      setOpenDialog(false);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.adminUsers(),
      });
    } catch {
      toast.error("An error occurred while changing the role. Please try again.");
    } finally {
      setIsLoading(false);
      setPendingAction(null);
    }
  };

  const passwordForm = useForm({
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
    onSubmit: async ({ value }) => {
      if (value.newPassword !== value.confirmNewPassword) {
        toast.error("Passwords do not match", cancelToastEl);
        return;
      }

      if (value.newPassword.length < 8) {
        toast.error("Password must be at least 8 characters", cancelToastEl);
        return;
      }

      setIsLoading(true);
      try {
        const response = await authClient.admin.setUserPassword({
          userId: user.id,
          newPassword: value.newPassword,
        });

        if (response.error) {
          toast.error(
            response.error.message || "Failed to set password. Please try again.",
            cancelToastEl,
          );
          return;
        }

        toast.success("Password set successfully", cancelToastEl);
        setOpenDialog(false);
        passwordForm.reset();
        await queryClient.invalidateQueries({
          queryKey: queryKeys.adminUsers(),
        });
      } catch {
        toast.error(
          "An error occurred while setting the password. Please try again.",
          cancelToastEl,
        );
      } finally {
        setIsLoading(false);
        setPendingAction(null);
      }
    },
  });

  const newRole = user.role === roles.ADMIN ? roles.USER : roles.ADMIN;
  const actionLabel = user.role === roles.ADMIN ? "Set as user" : "Set as admin";
  const canRevokeSessions = canModify && user.id !== currentUser.id;
  const canBan = canModify && user.id !== currentUser.id;
  const canRemove =
    currentUser.role === roles.SUPERADMIN &&
    user.role !== roles.SUPERADMIN &&
    user.id !== currentUser.id;

  const handleRevokeSessions = async () => {
    setIsLoading(true);
    try {
      const response = await authClient.admin.revokeUserSessions({ userId: user.id });

      if (response.error) {
        toast.error(response.error.message || "Failed to revoke sessions. Please try again.");
        return;
      }

      setOpenDialog(false);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.adminUsers(),
      });
    } catch {
      toast.error("An error occurred while revoking sessions. Please try again.");
    } finally {
      setIsLoading(false);
      setPendingAction(null);
    }
  };

  const handleBanToggle = async () => {
    setIsLoading(true);
    try {
      const response = user.banned
        ? await authClient.admin.unbanUser({ userId: user.id })
        : await authClient.admin.banUser({ userId: user.id });

      if (response.error) {
        toast.error(
          response.error.message ||
            `Failed to ${user.banned ? "unban" : "ban"} user. Please try again.`,
        );
        return;
      }

      setOpenDialog(false);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.adminUsers(),
      });
    } catch {
      toast.error(
        `An error occurred while ${user.banned ? "unbanning" : "banning"} the user. Please try again.`,
      );
    } finally {
      setIsLoading(false);
      setPendingAction(null);
    }
  };

  const handleRemoveUser = async () => {
    setIsLoading(true);
    try {
      const response = await authClient.admin.removeUser({ userId: user.id });

      if (response.error) {
        toast.error(response.error.message || "Failed to remove user. Please try again.");
        return;
      }

      setOpenDialog(false);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.adminUsers(),
      });
    } catch {
      toast.error("An error occurred while removing the user. Please try again.");
    } finally {
      setIsLoading(false);
      setPendingAction(null);
    }
  };

  const updateUserForm = useForm({
    defaultValues: {
      name: user.name ?? "",
      image: user.image ?? "",
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        const response = await authClient.admin.updateUser({
          userId: user.id,
          data: {
            name: value.name,
            image: value.image === "" ? null : value.image,
          },
        });

        if (response.error) {
          toast.error(
            response.error.message || "Failed to update user. Please try again.",
            cancelToastEl,
          );
          return;
        }

        setOpenDialog(false);
        await queryClient.invalidateQueries({
          queryKey: queryKeys.adminUsers(),
        });
      } catch {
        toast.error("An error occurred while updating the user. Please try again.", cancelToastEl);
      } finally {
        setIsLoading(false);
        setPendingAction(null);
      }
    },
  });

  const handleClearImage = async () => {
    setIsClearing(true);
    try {
      const response = await authClient.admin.updateUser({
        userId: user.id,
        data: {
          name: updateUserForm.getFieldValue("name"),
          image: null,
        },
      });

      if (response.error) {
        toast.error(
          response.error.message || "Failed to clear image. Please try again.",
          cancelToastEl,
        );
        return;
      }

      updateUserForm.setFieldValue("image", "");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.adminUsers(),
      });
    } catch {
      toast.error("An error occurred while clearing the image. Please try again.", cancelToastEl);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      {canModify ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button aria-label={`Open options for ${user.name}`} size="icon" variant="ghost">
                <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuGroup>
              {canChangeRole ? (
                <DropdownMenuItem
                  onClick={() => {
                    setPendingAction("set-role");
                    setOpenDialog(true);
                  }}
                >
                  {actionLabel}
                </DropdownMenuItem>
              ) : null}

              {canModify ? (
                <DropdownMenuItem
                  onClick={() => {
                    setPendingAction("set-password");
                    setOpenDialog(true);
                    passwordForm.reset();
                  }}
                >
                  Set user password
                </DropdownMenuItem>
              ) : null}

              {canModify ? (
                <DropdownMenuItem
                  onClick={() => {
                    setPendingAction("update-user");
                    setOpenDialog(true);
                    updateUserForm.reset();
                  }}
                >
                  Update user
                </DropdownMenuItem>
              ) : null}

              {canRevokeSessions ? (
                <DropdownMenuItem
                  onClick={() => {
                    setPendingAction("revoke-sessions");
                    setOpenDialog(true);
                  }}
                >
                  Revoke user sessions
                </DropdownMenuItem>
              ) : null}

              {canBan ? (
                <DropdownMenuItem
                  onClick={() => {
                    setPendingAction("ban-toggle");
                    setOpenDialog(true);
                  }}
                  variant={user.banned ? undefined : "destructive"}
                >
                  {user.banned ? "Unban user" : "Ban user"}
                </DropdownMenuItem>
              ) : null}

              {canRemove ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      setPendingAction("remove-user");
                      setOpenDialog(true);
                    }}
                  >
                    Remove user
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      {/* Confirmation Dialog for Role Change */}
      {pendingAction === "set-role" && (
        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change User Role</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to change{" "}
                <span className="font-semibold text-secondary-foreground">{user.name}</span>'s role
                from <span className="font-semibold text-secondary-foreground">{user.role}</span> to{" "}
                <span className="font-semibold text-secondary-foreground">{newRole}</span>? This
                action cannot be undone immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isLoading}
                onClick={(e) => {
                  e.preventDefault();
                  handleSetRole(newRole as "admin" | "user");
                }}
              >
                {isLoading ? "Changing..." : "Change Role"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Confirmation Dialog for Ban/Unban */}
      {pendingAction === "ban-toggle" && (
        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{user.banned ? "Unban User" : "Ban User"}</AlertDialogTitle>
              <AlertDialogDescription>
                {user.banned ? (
                  <>
                    Are you sure you want to unban{" "}
                    <span className="font-semibold text-secondary-foreground">{user.name}</span>?
                    They will be able to sign in again.
                  </>
                ) : (
                  <>
                    Are you sure you want to ban{" "}
                    <span className="font-semibold text-secondary-foreground">{user.name}</span>?
                    They will be immediately signed out and unable to sign in.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isLoading}
                variant={user.banned ? "default" : "destructive"}
                onClick={(e) => {
                  e.preventDefault();
                  handleBanToggle();
                }}
              >
                {isLoading
                  ? user.banned
                    ? "Unbanning..."
                    : "Banning..."
                  : user.banned
                    ? "Unban User"
                    : "Ban User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Confirmation Dialog for Revoking Sessions */}
      {pendingAction === "revoke-sessions" && (
        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke User Sessions</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to revoke all sessions for{" "}
                <span className="font-semibold text-secondary-foreground">{user.name}</span>? They
                will be signed out of all devices immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isLoading}
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  handleRevokeSessions();
                }}
              >
                {isLoading ? "Revoking..." : "Revoke Sessions"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Confirmation Dialog for Removing User */}
      {pendingAction === "remove-user" && (
        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently remove{" "}
                <span className="font-semibold text-secondary-foreground">{user.name}</span>? This
                will hard-delete their account and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isLoading}
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveUser();
                }}
              >
                {isLoading ? "Removing..." : "Remove User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Dialog for Setting User Password */}
      {pendingAction === "set-password" && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Password for {user.name}</DialogTitle>
              <DialogDescription>
                Enter a new password for this user. The password must be at least 8 characters.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                passwordForm.handleSubmit();
              }}
              className="flex flex-col gap-4"
            >
              <FieldGroup>
                {/* New Password */}
                <passwordForm.Field
                  name="newPassword"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value) return "Password is required";
                      if (value.length < 8) return "Password must be at least 8 characters";
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0 ? true : undefined}>
                      <FieldLabel htmlFor={field.name} className="text-sm font-medium">
                        New Password
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          type={showPassword ? "text" : "password"}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter new password"
                          disabled={isLoading}
                          aria-invalid={field.state.meta.errors.length > 0}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            <HugeiconsIcon
                              icon={showPassword ? ViewOffIcon : ViewIcon}
                              className="size-4"
                            />
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                      )}
                    </Field>
                  )}
                </passwordForm.Field>

                {/* Confirm Password */}
                <passwordForm.Field
                  name="confirmNewPassword"
                  validators={{
                    onChangeListenTo: ["newPassword"],
                    onChange: ({ value, fieldApi }) => {
                      if (!value) return "Please confirm the password";
                      if (value !== fieldApi.form.getFieldValue("newPassword"))
                        return "Passwords do not match";
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0 ? true : undefined}>
                      <FieldLabel htmlFor={field.name} className="text-sm font-medium">
                        Confirm Password
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          type={showConfirmPassword ? "text" : "password"}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Confirm password"
                          disabled={isLoading}
                          aria-invalid={field.state.meta.errors.length > 0}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            <HugeiconsIcon
                              icon={showConfirmPassword ? ViewOffIcon : ViewIcon}
                              className="size-4"
                            />
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                      )}
                    </Field>
                  )}
                </passwordForm.Field>
              </FieldGroup>

              <DialogFooter>
                <Button disabled={isLoading} variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button disabled={isLoading} type="submit">
                  {isLoading ? "Setting..." : "Set Password"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog for Updating User */}
      {pendingAction === "update-user" && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update {user.name}</DialogTitle>
              <DialogDescription>
                Update the name or profile image URL for this user.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateUserForm.handleSubmit();
              }}
              className="flex flex-col gap-4"
            >
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
                    {user.image && (
                      <AvatarImage src={user.image} alt={user.name} className={"rounded-xl"} />
                    )}
                    <AvatarFallback className="rounded-xl text-[10px] font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              <FieldGroup>
                {/* Image URL */}
                <updateUserForm.Field
                  name="image"
                  validators={{
                    onChange: ({ value }) => {
                      if (value && !z.url().safeParse(value).success)
                        return "Please enter a valid URL";
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0 ? true : undefined}>
                      <FieldLabel htmlFor={field.name} className="text-sm font-medium">
                        Image URL
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          type="url"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="https://example.com/avatar.png"
                          disabled={isLoading || isClearing}
                          aria-invalid={field.state.meta.errors.length > 0}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            size="xs"
                            variant="secondary"
                            type="button"
                            onClick={handleClearImage}
                            disabled={isLoading || isClearing}
                          >
                            {isClearing ? "Clearing..." : "Clear"}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                      )}
                    </Field>
                  )}
                </updateUserForm.Field>

                {/* Name */}
                <updateUserForm.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value) return "Name is required";
                      if (value.length < 2) return "Name must be at least 2 characters";
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0 ? true : undefined}>
                      <FieldLabel htmlFor={field.name} className="text-sm font-medium">
                        Name
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter user name"
                        disabled={isLoading || isClearing}
                        aria-invalid={field.state.meta.errors.length > 0}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                      )}
                    </Field>
                  )}
                </updateUserForm.Field>
              </FieldGroup>

              <DialogFooter>
                <Button
                  disabled={isLoading || isClearing}
                  variant="outline"
                  type="button"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <updateUserForm.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting || isLoading || isClearing}
                    >
                      {isSubmitting || isLoading ? "Saving..." : "Save changes"}
                    </Button>
                  )}
                </updateUserForm.Subscribe>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
