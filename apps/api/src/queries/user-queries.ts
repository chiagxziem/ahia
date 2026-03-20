import { db } from "@repo/db";

/** Fetches a user record by id */
export const getUserById = async (userId: string) => {
  const user = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  });

  return user || null;
};

/** Fetches a user record by email address */
export const getUserByEmail = async (email: string) => {
  const user = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  });

  return user || null;
};

/** Fetches a session record by session token */
export const getSessionByToken = async (sessionToken: string) => {
  const session = await db.query.session.findFirst({
    where: (ss, { eq }) => eq(ss.token, sessionToken),
  });

  return session || null;
};
