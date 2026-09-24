CREATE TYPE "public"."read_nomination_status" AS ENUM('open', 'parked', 'rejected');--> statement-breakpoint
CREATE TABLE "read_nomination" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"status" "read_nomination_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "read_nomination" ADD CONSTRAINT "read_nomination_book_id_read_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."read_book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_nomination" ADD CONSTRAINT "read_nomination_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "read_nomination_open_book_idx" ON "read_nomination" USING btree ("book_id") WHERE "read_nomination"."status" = 'open';--> statement-breakpoint
CREATE INDEX "read_nomination_book_idx" ON "read_nomination" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "read_nomination_status_idx" ON "read_nomination" USING btree ("status");