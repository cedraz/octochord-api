-- AlterTable
ALTER TABLE "public"."api_health_check_logs" ADD COLUMN     "error_message" TEXT,
ADD COLUMN     "status_code" INTEGER;

-- AlterTable
ALTER TABLE "public"."api_health_checks" ADD COLUMN     "sla_target" DOUBLE PRECISION NOT NULL DEFAULT 99.9;
