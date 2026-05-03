import ApiResponse from "../../common/utils/api-response.js";
import {
  buildConsentRedirect,
  exchangeAuthorizationCode,
  exchangeRefreshToken,
  getDiscoveryDocument,
  getJwksPayload,
  getUserInfoClaims,
} from "./oauth.service.js";

export const getOpenIdConfiguration = async (req, res) => {
  return res.json(getDiscoveryDocument());
};

export const getJwks = async (req, res) => {
  return res.json(await getJwksPayload());
};

export const authorize = async (req, res, next) => {
  try {
    const redirectUrl = await buildConsentRedirect(req.query);
    return res.redirect(302, redirectUrl);
  } catch (error) {
    next(error);
  }
};

export const exchangeToken = async (req, res, next) => {
  try {
    const params = req.body;
    let tokenResponse;

    if (params.grant_type === "authorization_code") {
      tokenResponse = await exchangeAuthorizationCode(params);
    } else if (params.grant_type === "refresh_token") {
      tokenResponse = await exchangeRefreshToken(params);
    } else {
      return ApiResponse.oauthError(
        res,
        400,
        "unsupported_grant_type",
        "Supported grant types are authorization_code and refresh_token.",
      );
    }

    return ApiResponse.oauthToken(res, tokenResponse);
  } catch (error) {
    if (error.oauthError) {
      return ApiResponse.oauthError(
        res,
        error.statusCode || 400,
        error.oauthError,
        error.message,
      );
    }

    next(error);
  }
};

export const getUserInfo = async (req, res, next) => {
  try {
    const claims = await getUserInfoClaims(req.accessTokenPayload.sub);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    return res.json(claims);
  } catch (error) {
    next(error);
  }
};
