import fs from "node:fs/promises";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import jose from "node-jose";
import config from "../config/connection.js";

const keyCache = {
  privateKey: null,
  publicKey: null,
  jwks: null,
};

const readKey = async (filePath) => fs.readFile(filePath, "utf8");

const getPrivateKey = async () => {
  if (!keyCache.privateKey) {
    keyCache.privateKey = await readKey(config.privateKeyPath);
  }

  return keyCache.privateKey;
};

const getPublicKey = async () => {
  if (!keyCache.publicKey) {
    keyCache.publicKey = await readKey(config.publicKeyPath);
  }

  return keyCache.publicKey;
};

export const buildAccessTokenHash = (accessToken) => {
  const digest = crypto.createHash("sha256").update(accessToken, "ascii").digest();
  return digest.subarray(0, digest.length / 2).toString("base64url");
};

export const signJwt = async (payload, options = {}) => {
  const privateKey = await getPrivateKey();

  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    issuer: config.issuer,
    keyid: config.keyId,
    ...options,
  });
};

export const verifyJwt = async (token, options = {}) => {
  const publicKey = await getPublicKey();

  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
    issuer: config.issuer,
    ...options,
  });
};

export const getJwks = async () => {
  if (!keyCache.jwks) {
    const publicKey = await getPublicKey();
    const jwk = await jose.JWK.asKey(publicKey, "pem");
    keyCache.jwks = {
      keys: [
        {
          ...jwk.toJSON(),
          use: "sig",
          alg: "RS256",
          kid: config.keyId,
        },
      ],
    };
  }

  return keyCache.jwks;
};
