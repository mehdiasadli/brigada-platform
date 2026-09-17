UPDATE "user" AS u
SET username = 'd' || a.account_id
FROM account AS a
WHERE a.user_id = u.id
  AND a.provider_id = 'discord'
  AND u.username IS NULL;
--> statement-breakpoint
UPDATE "user"
SET username = 'u' || left(replace(id::text, '-', ''), 29)
WHERE username IS NULL;
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "username" SET NOT NULL;
