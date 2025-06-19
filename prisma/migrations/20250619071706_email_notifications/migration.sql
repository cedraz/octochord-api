/*
  Warnings:

  - Added the required column `updated_at` to the `integrations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "integrations" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "email_notifications" (
    "id" SERIAL NOT NULL,
    "emails" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "api_health_check_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "email_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_integrations" (
    "id" SERIAL NOT NULL,
    "emails" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "integration_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "email_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_notifications_api_health_check_id_key" ON "email_notifications"("api_health_check_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_integrations_integration_id_key" ON "email_integrations"("integration_id");

-- AddForeignKey
ALTER TABLE "email_notifications" ADD CONSTRAINT "email_notifications_api_health_check_id_fkey" FOREIGN KEY ("api_health_check_id") REFERENCES "api_health_checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_integrations" ADD CONSTRAINT "email_integrations_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations"("hook_id") ON DELETE CASCADE ON UPDATE CASCADE;
