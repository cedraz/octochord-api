-- CreateTable
CREATE TABLE "api_health_check_logs" (
    "id" SERIAL NOT NULL,
    "status" "APIStatus" NOT NULL,
    "responseTime" INTEGER NOT NULL DEFAULT 0,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "api_health_check_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "api_health_check_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "api_health_check_logs" ADD CONSTRAINT "api_health_check_logs_api_health_check_id_fkey" FOREIGN KEY ("api_health_check_id") REFERENCES "api_health_checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
