import { auth } from "@/lib/auth";

export type AppEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    sessionToken: string;
  };
};

export type Role = "user" | "admin" | "superadmin";
