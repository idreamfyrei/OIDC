import express from "express";
import config from "./common/config/connection.js";
import ApiResponse from "./common/utils/api-response.js";
import authRoutes from "./module/auth/auth.route.js";
import accountRoutes from "./module/account/account.route.js";
import clientRoutes from "./module/client/client.route.js";
import oauthRoutes from "./module/oauth/oauth.route.js";
import webRoutes from "./module/web/web.route.js";
import errorHandler from "./common/middleware/error-handler.js";

const app = express();

const issuerUrl = new URL(config.issuer);

const enforceCanonicalIssuerHost = (req, res, next) => {
  const requestHost = req.get("host");

  if (req.path === "/health") {
    return next();
  }

  if (!requestHost || requestHost.toLowerCase() === issuerUrl.host.toLowerCase()) {
    return next();
  }

  const target = new URL(req.originalUrl || req.url, issuerUrl);
  return res.redirect(req.method === "GET" || req.method === "HEAD" ? 302 : 308, target.toString());
};

app.set("trust proxy", true);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(enforceCanonicalIssuerHost);
app.use(express.static("public"));
app.use(oauthRoutes);
app.use(webRoutes);
app.use(clientRoutes);
app.use(accountRoutes);
app.use(authRoutes);

app.get("/health", (_req, res) => {
  return ApiResponse.ok(res, "OK");
});

app.use(errorHandler);

export default app;
