import { $fetch } from "@/lib/fetch";
import { errorResSchema, successResSchema } from "@/lib/schemas";
import { UserSelectSchema } from "@repo/db/validators/user.validator";

export const getUser = async (headers: Headers) => {
  const { data, error } = await $fetch("/user/me", {
    output: successResSchema(UserSelectSchema),
    headers,
    errorSchema: errorResSchema,
  });

  if (error) {
    console.error(error);
    return null;
  }

  return data?.data ?? null;
};
