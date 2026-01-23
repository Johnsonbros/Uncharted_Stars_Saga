-- Phase 3: Authentication and Chapters tables
-- Sessions table for listener authentication
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "listener_id" uuid NOT NULL REFERENCES "listeners"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "token" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "sessions_token_unique" UNIQUE("token")
);

-- Magic links table for passwordless authentication
CREATE TABLE IF NOT EXISTS "magic_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "token" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "used_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "magic_links_token_unique" UNIQUE("token")
);

-- Chapters table for audiobook content
CREATE TABLE IF NOT EXISTS "chapters" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "subtitle" text,
  "description" text,
  "audio_storage_path" text,
  "duration_seconds" integer DEFAULT 0 NOT NULL,
  "sequence_order" integer NOT NULL,
  "published_at" timestamp with time zone,
  "is_published" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "chapters_slug_unique" UNIQUE("slug")
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "sessions_listener_id_idx" ON "sessions" ("listener_id");
CREATE INDEX IF NOT EXISTS "sessions_token_idx" ON "sessions" ("token");
CREATE INDEX IF NOT EXISTS "magic_links_token_idx" ON "magic_links" ("token");
CREATE INDEX IF NOT EXISTS "magic_links_email_idx" ON "magic_links" ("email");
CREATE INDEX IF NOT EXISTS "chapters_slug_idx" ON "chapters" ("slug");
CREATE INDEX IF NOT EXISTS "chapters_sequence_order_idx" ON "chapters" ("sequence_order");
