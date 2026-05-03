import bcrypt from "bcrypt";
import { db } from "../../common/db/index.js";
import { usersTable } from "../../common/db/db.js";
import ApiError from "../../common/utils/api-error.js";
import { createAccountSchema } from "./account.schema.js";
import { issueAuthorizationRedirect } from "../oauth/oauth.service.js";
import { validateAuthorizeRequest } from "../oauth/authorize.service.js";
import { findUserByEmail } from "./account.repository.js";

export const registerAccount = async (body) => {
  const parsed = createAccountSchema.parse(body);
  const authorizeRequest = await validateAuthorizeRequest(parsed);
  const existingUser = await findUserByEmail(parsed.email);

  if (existingUser) {
    throw ApiError.conflict("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(parsed.password, 10);

  const insertedUsers = await db
    .insert(usersTable)
    .values({
      firstName: parsed.firstName,
      lastName: parsed.lastName || null,
      email: parsed.email,
      password: passwordHash,
      profileImageURL: null,
      emailVerified: true,
    })
    .returning();

  const user = insertedUsers[0];
  return issueAuthorizationRedirect(user, authorizeRequest);
};
