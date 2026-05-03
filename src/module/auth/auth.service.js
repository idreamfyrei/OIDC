import bcrypt from "bcrypt";
import ApiError from "../../common/utils/api-error.js";
import { buildUserProfile, findUserByEmail } from "../account/account.repository.js";
import { authenticateUserSchema, signInSchema } from "./auth.schema.js";
import { issueAuthorizationRedirect } from "../oauth/oauth.service.js";
import { validateAuthorizeRequest } from "../oauth/authorize.service.js";

const getUserForPassword = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user?.password) {
    throw ApiError.unauthorized("Invalid email or password.");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password.");
  }

  return user;
};

export const signInWithPassword = async (payload) => {
  const parsed = signInSchema.parse(payload);
  const authorizeRequest = await validateAuthorizeRequest(parsed);
  const user = await getUserForPassword(parsed);

  return issueAuthorizationRedirect(user, authorizeRequest);
};

export const authenticateUserWithPassword = async (payload) => {
  const parsed = authenticateUserSchema.parse(payload);
  const user = await getUserForPassword(parsed);

  return buildUserProfile(user);
};
