ALTER TABLE "oauth_clients" ADD COLUMN IF NOT EXISTS "client_secret_hash" text;
