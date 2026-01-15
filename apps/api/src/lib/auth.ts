import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin, bearer } from "better-auth/plugins";

import { db } from "@repo/db";

import { createCartForUser } from "../queries/cart-queries";
import { sendResetPasswordEmail, sendVerificationEmail } from "./email";
import env from "./env";
import { ac, admin, superadmin, user } from "./permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token }) => {
      await sendResetPasswordEmail({
        to: user.email,
        token,
        name: user.name,
      });
    },
    revokeSessionsOnPasswordReset: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, token }) => {
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        token,
      });
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await createCartForUser(user.id);
        },
      },
    },
  },

  trustedOrigins: [env.API_URL, env.WEB_URL],

  session: {
    expiresIn: 60 * 60 * 24 * 30,
  },

  advanced: {
    database: { generateId: "uuid" },
    cookies: {
      session_token: {
        name: "ahia_auth_session",
        attributes: {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          domain: process.env.NODE_ENV === "production" ? process.env.DOMAIN : undefined,
          expires: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000),
        },
      },
    },
  },

  experimental: {
    joins: true,
  },

  plugins: [
    bearer(),
    adminPlugin({
      ac,
      roles: {
        user,
        admin,
        superadmin,
      },
      adminRoles: ["admin", "superadmin"],
      impersonationSessionDuration: 60 * 60 * 24,
    }),
  ],
});
