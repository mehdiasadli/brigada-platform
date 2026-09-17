CREATE TYPE "public"."read_reader_status" AS ENUM('reading', 'sat_out', 'dnf');--> statement-breakpoint
ALTER TABLE "read_session_reader" ADD COLUMN "status" "read_reader_status" DEFAULT 'reading' NOT NULL;
