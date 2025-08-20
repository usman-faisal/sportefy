ALTER TABLE "matches" RENAME COLUMN "invite_token" TO "match_code";--> statement-breakpoint
ALTER TABLE "matches" DROP CONSTRAINT "matches_invite_token_unique";--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_match_code_unique" UNIQUE("match_code");