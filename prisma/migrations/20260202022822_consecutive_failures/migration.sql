-- AlterTable
ALTER TABLE "public"."api_health_checks" ADD COLUMN     "consecutive_failures" INTEGER NOT NULL DEFAULT 0;
