# OIDC Identity Provider (IdP) - POC Spec Sheet

> **A from-scratch implementation of an OpenID Connect Identity Provider, built to understand how auth systems actually work under the hood.**

This is a learning-first project. The goal is not to build a production-ready auth service. The goal is to implement the important parts of the OIDC Authorization Code Flow manually so things like discovery, PKCE verification, JWT signing, refresh tokens, and userinfo stop feeling like black boxes.

If you have mostly interacted with OIDC from the client side by using Google, GitHub, or another hosted IdP, this project helps flip that mental model and show what the provider side has to do.

---

## What We're Building

Two demo-facing pieces live in this repo:

**1. The IdP Service**  
The identity provider. It handles user registration, sign-in, client registration, authorization, token issuance, JWKS exposure, and userinfo responses.

**2. A Demo Client Experience**  
A small frontend served from `public/` that demonstrates both:

- the classic authorization code redirect flow
- a Backend-for-Frontend (BFF) style web login flow under `/web/*`

This makes the repo useful both for learning the protocol and for seeing what a browser-facing integration looks like.

---

## Educational Purpose

This repository is a proof of concept for education, experimentation, and demos.

- Built to understand OIDC and OAuth 2.0 internals
- Good for local testing and protocol walkthroughs
- Not presented as production-ready authentication infrastructure
- Security hardening, monitoring, audit controls, and operational safeguards are intentionally incomplete

---

## Concepts Implemented

- OpenID Connect Authorization Code Flow
- PKCE with `S256`
- RS256 JWT signing with an asymmetric key pair
- JWKS endpoint for public key discovery
- OpenID Connect Discovery document
- Access tokens
- ID tokens
- Refresh tokens with rotation-like replacement behavior
- Userinfo endpoint
- OAuth client registration
- Consent page before completing login
- Web session handling for a BFF-style demo flow

---

## Tech Stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js |
| Language | JavaScript (ES modules) |
| Framework | Express |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| JWT signing | `jsonwebtoken` |
| JWK / JWKS conversion | `node-jose` |
| Password hashing | `bcrypt` |
| Validation | Zod |
| File uploads | Multer |
| Image hosting | ImageKit |

---

## OIDC Flow - Full Picture

```text
User starts login from a client app
          |
          v
Client redirects user to /oauth/authorize
with: client_id, redirect_uri, scope, state,
      nonce, code_challenge, code_challenge_method
          |
          v
IdP validates client_id, redirect_uri, response_type,
PKCE fields, and nonce rules
          |
          v
IdP redirects to consent/login UI
          |
          v
User signs in or creates an account
          |
          v
IdP creates an authorization code
stores: code, user_id, client_id, redirect_uri,
        scope, nonce, code_challenge, expires_at
          |
          v
IdP redirects back to the client redirect_uri
with: ?code=AUTH_CODE&state=STATE
          |
          v
Client backend calls /oauth/token
with: code, client_id, redirect_uri, code_verifier,
      grant_type=authorization_code
          |
          v
IdP verifies:
- code exists
- code is not expired
- client_id matches
- redirect_uri matches
- PKCE verifier matches stored challenge
          |
          v
IdP consumes the auth code
issues: access_token + refresh_token + id_token
          |
          v
Client can call /oauth/userinfo using the access token
or maintain its own application session
```

---

## BFF Demo Flow

The repo also contains a simple server-managed web login flow:

```text
Browser visits /
     |
     v
GET /web/login/start
     |
     v
Server creates PKCE + state + nonce
stores them in an HttpOnly flow cookie
     |
     v
Redirect to /oauth/authorize
     |
     v
User signs in through the IdP UI
     |
     v
Redirect lands on /web/login/callback
     |
     v
Server exchanges code for tokens
creates web session row in PostgreSQL
sets HttpOnly session cookie
     |
     v
Browser calls /web/me, /web/refresh, /web/logout
without holding raw OAuth tokens in JS
```

This is useful for understanding how a browser app can avoid storing tokens directly in frontend JavaScript.

---

## Database Schema

The actual schema is implemented with Drizzle in [src/common/db/db.js](/Users/saumya/Documents/GitHub/oidc/src/common/db/db.js). Below is the conceptual shape.

### `users`

```js
{
  id: uuid,
  firstName: string,
  lastName: string,
  profileImageURL: string | null,
  email: string,
  emailVerified: boolean,
  password: string | null,
  salt: string | null,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

Stores local IdP accounts used for sign-in and for building OIDC claims like `sub`, `name`, and `email`.

### `oauth_clients`

```js
{
  id: uuid,
  clientId: string,
  clientName: string,
  redirectUris: string,
  applicationType: string,
  tokenEndpointAuthMethod: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

Represents registered OAuth clients. In the current POC, the token endpoint auth method is intentionally simple and defaults to `none`, which means public-client style exchanges are the main learning path.

### `oauth_authorization_codes`

```js
{
  id: uuid,
  code: string,
  userId: uuid,
  clientId: string,
  redirectUri: string,
  scope: string,
  nonce: string | null,
  codeChallenge: string,
  codeChallengeMethod: string,
  expiresAt: timestamp,
  createdAt: timestamp
}
```

Stores short-lived authorization codes and the PKCE challenge data required during token exchange.

**Current implementation note:**  
Authorization codes are deleted when consumed. That keeps the implementation simple, but it does remove the audit trail. A future improvement would be to keep the row and mark it with `usedAt`.

### `oauth_refresh_tokens`

```js
{
  id: uuid,
  token: string,
  userId: uuid,
  clientId: string,
  scope: string,
  nonce: string | null,
  expiresAt: timestamp,
  createdAt: timestamp,
  rotatedFromTokenId: uuid | null
}
```

Refresh tokens are persisted so the server can issue new access tokens without forcing the user to log in again.

### `web_sessions`

```js
{
  id: uuid,
  sessionId: string,
  userId: uuid,
  clientId: string,
  csrfNonce: string,
  accessToken: string,
  refreshToken: string,
  idToken: string | null,
  scope: string,
  accessTokenExpiresAt: timestamp,
  expiresAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

Supports the BFF demo flow by storing server-side session state and sending only an HttpOnly cookie to the browser.

---

## RS256 Key Pair

This IdP signs tokens with RS256 using a private/public key pair.

- The server signs JWTs with the private key
- Clients verify JWTs with the public key exposed via JWKS
- Verifiers do not need access to the signing key

Generate keys locally:

```bash
mkdir -p cert
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out cert/private-key.pem
openssl rsa -in cert/private-key.pem -pubout -out cert/public-key.pub
```

Set `KEY_ID` in your environment and keep the same key pair across restarts. If you regenerate keys, old tokens will no longer verify.

---

## API Endpoints

### Discovery

- `GET /.well-known/openid-configuration`
- `GET /.well-known/jwks.json`

### OAuth

- `GET /oauth/authorize`
- `POST /oauth/token`
- `GET /oauth/userinfo`

### Accounts and Auth

- `POST /accounts/register`
- `POST /auth/sign-in`

### Clients

- `GET /clients`
- `GET /clients/:clientId`
- `POST /clients/register`

### Web BFF Demo

- `GET /web/login/start`
- `GET /web/login/callback`
- `GET /web/me`
- `POST /web/refresh`
- `POST /web/logout`

---

## Discovery Document

The discovery document is exposed at `/.well-known/openid-configuration`.

It currently advertises:

```json
{
  "issuer": "http://localhost:3000",
  "authorization_endpoint": "http://localhost:3000/oauth/authorize",
  "token_endpoint": "http://localhost:3000/oauth/token",
  "userinfo_endpoint": "http://localhost:3000/oauth/userinfo",
  "jwks_uri": "http://localhost:3000/.well-known/jwks.json",
  "response_types_supported": ["code"],
  "subject_types_supported": ["public"],
  "id_token_signing_alg_values_supported": ["RS256"],
  "scopes_supported": ["openid", "profile", "email", "offline_access"],
  "token_endpoint_auth_methods_supported": ["none"],
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "code_challenge_methods_supported": ["S256"]
}
```

---

## Token Shapes

### Access Token

```json
{
  "sub": "user-uuid",
  "scope": "openid profile email offline_access",
  "token_use": "access_token",
  "iss": "http://localhost:3000",
  "aud": "userinfo",
  "iat": 1710000000,
  "exp": 1710003600
}
```

### ID Token

```json
{
  "sub": "user-uuid",
  "aud": "oidc-web-client",
  "email": "user@example.com",
  "email_verified": true,
  "name": "Jane Doe",
  "given_name": "Jane",
  "family_name": "Doe",
  "picture": "https://example.com/avatar.png",
  "token_use": "id_token",
  "auth_time": 1710000000,
  "nonce": "nonce-from-authorize-request",
  "at_hash": "hash-of-access-token",
  "iss": "http://localhost:3000",
  "iat": 1710000000,
  "exp": 1710003600
}
```

### Refresh Token

```json
{
  "refresh_token": "opaque-random-base64url-string"
}
```

---

## PKCE Verification Logic

```text
During /oauth/authorize:
- client sends code_challenge
- server stores code_challenge with the auth code

During /oauth/token:
- client sends original code_verifier
- server computes base64url(sha256(code_verifier))
- server compares computed value with stored code_challenge
- mismatch => invalid_grant
```

This prevents an intercepted authorization code from being redeemed without the original verifier.

---

## State Parameter

The current implementation treats `state` as client-managed CSRF protection.

- The IdP receives it
- The IdP echoes it back during redirect
- The client is responsible for storing and validating it

In the BFF flow, the server also maintains a login flow cookie containing the generated state and nonce so the callback can be matched safely.

---

## Project Structure

```text
src/
  common/
    config/
    db/
    middleware/
    utils/
  module/
    account/
    auth/
    client/
    oauth/
    web/
public/
  index.html
  consent.html
  authenticate.html
  signup.html
  callback.html
  client-register.html
drizzle/
index.js
README.md
```

---

## Getting Started

```bash
pnpm install
./key-gen.sh
cp .env.example .env
pnpm db:generate
pnpm db:migrate
pnpm dev
```

By default, the app runs on:

```text
http://localhost:3000
```

Use [.env.example](/Users/saumya/Documents/GitHub/oidc/.env.example) as the configuration reference.

## Deploying To Railway

1. Create a new Railway project from this GitHub repository.
2. Add a Railway PostgreSQL service, then copy its `DATABASE_URL` into the app service variables.
3. Set the app variables:

```text
NODE_ENV=production
ISSUER=https://your-railway-app.up.railway.app
WEB_BFF_REDIRECT_URI=https://your-railway-app.up.railway.app/web/login/callback
DATABASE_URL=postgresql://...
KEY_ID=key-1
PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----
```

Use Railway's public app domain for `ISSUER` and `WEB_BFF_REDIRECT_URI`. Do not use a `*.railway.internal` hostname; that hostname is only reachable from other Railway services and will fail in a user's browser with `DNS_PROBE_FINISHED_NXDOMAIN`.

4. Generate the RSA keys locally with `./key-gen.sh`, then paste the private and public PEM values into Railway as `PRIVATE_KEY` and `PUBLIC_KEY`. Keep the same keys across deploys so existing tokens continue to verify.
5. Set Railway's start command to `pnpm start` if it does not detect it automatically.
6. Run database migrations against the Railway database:

```bash
pnpm db:migrate
```

7. After the first deploy, test:

```text
https://your-railway-app.up.railway.app/.well-known/openid-configuration
https://your-railway-app.up.railway.app/.well-known/jwks.json
```

For any external client app, register the exact production callback URL in `/client-register.html` or configure the matching client redirect URI before starting the login flow.

---

## Current State Of The Codebase

The codebase is fairly clean for a POC:

- routes, controllers, services, schemas, and shared utilities are separated clearly
- OIDC concerns are grouped under `src/module/oauth`
- the BFF demo flow is isolated under `src/module/web`
- request validation and token logic are not mixed directly into route files

That said, I would not call it fully refactored yet. There are still some simplifications that are acceptable for a learning project but worth improving:

- authorization codes are deleted on use instead of being retained with a `usedAt` timestamp
- token endpoint auth is currently public-client oriented with `token_endpoint_auth_methods_supported: ["none"]`
- refresh token lifecycle is simple and would benefit from explicit reuse detection and revocation metadata
- cookie parsing and serialization are handwritten rather than delegated to hardened middleware/utilities
- some naming and README language historically mixed the classic redirect flow and the BFF flow, which can confuse readers

---

## Future Improvements

- Add `usedAt`, `revokedAt`, and audit metadata for authorization codes instead of deleting consumed rows
- Add confidential client support with `client_secret` storage and verification
- Hash refresh tokens at rest instead of storing raw token values
- Implement refresh token reuse detection and family invalidation
- Add explicit logout and revocation semantics for OAuth clients, not just web sessions
- Add stronger session CSRF protection patterns for browser-driven state changes
- Move cookie parsing to a dedicated library and centralize cookie policy configuration
- Add rate limiting for login, signup, token exchange, and client registration endpoints
- Add structured request logging and security event logging
- Add automated tests for authorize, token, refresh, userinfo, and BFF session flows
- Add cleanup jobs for expired auth codes, refresh tokens, and web sessions
- Add stricter scope validation and per-client allowed scope configuration
- Add issuer, cookie, and proxy hardening guidance for real deployments
- Add key rotation support with multiple active JWKs
- Add account recovery, email verification, and stronger user lifecycle controls
- Add API documentation examples for each endpoint and common failure response
- Add Docker-based local setup for faster onboarding

---

## What This Is Not

This is a proof of concept for learning. It is not:

- Production ready
- Security audited
- Multi-tenant hardened
- Compliance ready

---

## References

- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [PKCE RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)
- [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html)
- [JWT RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)
- [JWK RFC 7517](https://datatracker.ietf.org/doc/html/rfc7517)
- [node-jose](https://github.com/cisco/node-jose)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
