import bcrypt from "bcrypt";
import ApiError from "../../common/utils/api-error.js";
import { findUserByEmail } from "../account/account.repository.js";
import { signInSchema } from "./auth.schema.js";
import { issueAuthorizationRedirect } from "../oauth/oauth.service.js";
import { validateAuthorizeRequest } from "../oauth/authorize.service.js";

export const signInWithPassword = async (payload) => {
  const parsed = signInSchema.parse(payload);
  const authorizeRequest = await validateAuthorizeRequest(parsed);
  const user = await findUserByEmail(parsed.email);

  if (!user?.password) {
    throw ApiError.unauthorized("Invalid email or password.");
  }

  const passwordMatches = await bcrypt.compare(parsed.password, user.password);

  if (!passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password.");
  }

  return issueAuthorizationRedirect(user, authorizeRequest);
};
