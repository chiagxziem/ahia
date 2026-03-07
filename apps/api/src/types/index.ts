import type { auth } from "@repo/auth/server";

export type AppEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user;
  };
};

export type Role = "user" | "admin" | "superadmin";
