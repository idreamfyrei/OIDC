ALTER TABLE "oauth_clients" ADD COLUMN "app_url" text;--> statement-breakpoint
ALTER TABLE "oauth_clients" ADD COLUMN "owner_user_id" uuid;--> statement-breakpoint
ALTER TABLE "oauth_clients" ADD CONSTRAINT "oauth_clients_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "oauth_clients_owner_user_id_idx" ON "oauth_clients" USING btree ("owner_user_id");