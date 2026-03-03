import { $fetch } from "@/lib/fetch";
import { successResSchema } from "@/lib/schemas";
import { UserSelectSchema } from "@repo/db/validators/user.validator";

export const getUser = async (cookie?: string) => {
  const { data, error } = await $fetch("/user/me", {
    output: successResSchema(UserSelectSchema),
    headers: cookie ? { cookie } : undefined,
  });

  if (error) {
    console.error(error);
    return null;
  }

  return data?.data ?? null;
};
