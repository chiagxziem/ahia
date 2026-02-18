import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { session } from "../schemas/auth.schema";

export const SessionSelectSchema = createSelectSchema(session).extend({
  createdAt: z.iso.datetime().transform((n) => new Date(n)),
  updatedAt: z.iso.datetime().transform((n) => new Date(n)),
  expiresAt: z.iso.datetime().transform((n) => new Date(n)),
});
