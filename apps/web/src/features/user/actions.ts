"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { UserUpdateSchema } from "@repo/db/validators/user.validator";

import { $fetchAndThrow } from "@/lib/fetch";
import { successResSchema } from "@/lib/schemas";

export const updateUser = async (body: z.infer<typeof UserUpdateSchema>) => {
  const headersList = await headers();

  const { data: response } = await $fetchAndThrow("/user/me", {
    method: "PATCH",
    headers: {
      cookie: headersList.get("cookie") ?? "",
    },
    body,
    output: successResSchema(
      z.object({
        status: z.literal(true),
      }),
    ),
  });

  return response;
};
