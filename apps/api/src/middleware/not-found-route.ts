import type { NotFoundHandler } from "hono";

import HttpStatusCodes from "@/lib/http-status-codes";

const notFoundRoute: NotFoundHandler = (c) => {
  return c.json(
    {
      message: `Route not found - '${c.req.path}'`,
    },
    HttpStatusCodes.NOT_FOUND,
  );
};

export default notFoundRoute;
