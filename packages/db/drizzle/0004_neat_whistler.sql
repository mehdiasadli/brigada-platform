CREATE TYPE "public"."read_book_status" AS ENUM('readlist', 'reading', 'completed', 'removed');--> statement-breakpoint
CREATE TYPE "public"."read_session_status" AS ENUM('not_started', 'voting', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "read_book" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"olib_key" text NOT NULL,
	"author" text NOT NULL,
	"page_count" integer NOT NULL,
	"first_publish_year" integer NOT NULL,
	"subtitle" text,
	"description" text,
	"cover_id" integer,
	"status" "read_book_status" DEFAULT 'readlist' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "read_book_slug_unique" UNIQUE("slug"),
	CONSTRAINT "read_book_olib_key_unique" UNIQUE("olib_key")
);
--> statement-breakpoint
CREATE TABLE "read_member" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "read_progress" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"percentage" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"is_completed" boolean DEFAULT false NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"progress_updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "read_review" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"body" text,
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "read_session" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"book_id" uuid,
	"status" "read_session_status" DEFAULT 'not_started' NOT NULL,
	"voting_started_at" timestamp,
	"voting_deadline" timestamp,
	"voting_ended_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"reading_deadline" timestamp,
	"discord_poll_message_id" text,
	"discord_poll_channel_id" text,
	"midterm_posted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "read_session_candidate" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"page_count" integer NOT NULL,
	"first_publish_year" integer NOT NULL,
	"discord_answer_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "read_session_reader" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "read_member" ADD CONSTRAINT "read_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_progress" ADD CONSTRAINT "read_progress_session_id_read_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."read_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_progress" ADD CONSTRAINT "read_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_review" ADD CONSTRAINT "read_review_book_id_read_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."read_book"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_review" ADD CONSTRAINT "read_review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_session" ADD CONSTRAINT "read_session_book_id_read_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."read_book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_session_candidate" ADD CONSTRAINT "read_session_candidate_session_id_read_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."read_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_session_candidate" ADD CONSTRAINT "read_session_candidate_book_id_read_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."read_book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_session_reader" ADD CONSTRAINT "read_session_reader_session_id_read_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."read_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_session_reader" ADD CONSTRAINT "read_session_reader_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "read_progress_session_user_idx" ON "read_progress" USING btree ("session_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "read_review_book_user_idx" ON "read_review" USING btree ("book_id","user_id");--> statement-breakpoint
CREATE INDEX "read_session_status_idx" ON "read_session" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "read_session_candidate_session_book_idx" ON "read_session_candidate" USING btree ("session_id","book_id");--> statement-breakpoint
CREATE INDEX "read_session_candidate_session_idx" ON "read_session_candidate" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "read_session_reader_session_user_idx" ON "read_session_reader" USING btree ("session_id","user_id");--> statement-breakpoint
CREATE INDEX "read_session_reader_session_idx" ON "read_session_reader" USING btree ("session_id");