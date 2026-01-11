import { createSelectSchema } from "drizzle-zod";
import z from "zod";

import { session } from "../schemas/auth.schema";

export const SessionSelectSchema = createSelectSchema(session).extend({
  createdAt: z.number().transform((n) => new Date(n)),
  updatedAt: z.number().transform((n) => new Date(n)),
  expiresAt: z.number().transform((n) => new Date(n)),
});
