CREATE TABLE "oauth_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar(255) NOT NULL,
	"client_name" varchar(255) NOT NULL,
	"redirect_uris" text NOT NULL,
	"application_type" varchar(30) NOT NULL,
	"token_endpoint_auth_method" varchar(30) DEFAULT 'none' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_clients_client_id_unique_idx" ON "oauth_clients" USING btree ("client_id");