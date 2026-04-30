import ApiResponse from "../../common/utils/api-response.js";
import { getWebSessionFromRequest } from "./web.service.js";

export const requireWebSession = async (req, res, next) => {
  try {
    const session = await getWebSessionFromRequest(req);
    req.webSession = session;
    next();
  } catch (error) {
    return ApiResponse.oauthError(res, 401, "invalid_session", error.message);
  }
};
