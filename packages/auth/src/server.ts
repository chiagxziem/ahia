import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin, bearer, openAPI } from "better-auth/plugins";

import { db } from "@repo/db";

import { createCartForUser } from "./lib/actions";
import { sendResetPasswordEmail, sendVerificationEmail } from "./lib/email";
import { ac, admin, superadmin, user as userRole } from "./lib/permissions";

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

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  account: {
    accountLinking: {
      enabled: true,
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

  baseURL: process.env.API_URL,
  trustedOrigins: [process.env.WEB_URL!, process.env.API_URL!],

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
          domain:
            process.env.NODE_ENV === "production"
              ? process.env.DOMAIN
              : undefined,
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
    openAPI(),
    adminPlugin({
      ac,
      roles: {
        userRole,
        admin,
        superadmin,
      },
      adminRoles: ["admin", "superadmin"],
      impersonationSessionDuration: 60 * 60 * 24,
    }),
  ],
});
