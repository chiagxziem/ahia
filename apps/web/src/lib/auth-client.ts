import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import env from "./env";
import { ac, admin, superadmin, user } from "./permissions";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL,
  plugins: [
    adminClient({
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
