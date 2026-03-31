ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "knowledge_repo_url" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "knowledge_repo_token" text;
