import { Router } from "express";
import {
  authorize,
  exchangeToken,
  getJwks,
  getOpenIdConfiguration,
  getUserInfo,
} from "./oauth.controller.js";
import { requireAccessToken } from "./oauth.middleware.js";

const oauthRouter = Router();

oauthRouter.get("/.well-known/openid-configuration", getOpenIdConfiguration);
oauthRouter.get("/.well-known/jwks.json", getJwks);
oauthRouter.get("/oauth/authorize", authorize);
oauthRouter.post("/oauth/token", exchangeToken);
oauthRouter.get("/oauth/userinfo", requireAccessToken, getUserInfo);

export default oauthRouter;
