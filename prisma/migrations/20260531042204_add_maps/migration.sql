/*
  Warnings:

  - You are about to drop the column `responseTime` on the `api_health_check_logs` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `one_time_codes` table. All the data in the column will be lost.
  - You are about to drop the column `hashedToken` on the `refresh_tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hashed_token]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expires_at` to the `one_time_codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hashed_token` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."refresh_tokens_hashedToken_key";

-- AlterTable
ALTER TABLE "public"."api_health_check_logs" DROP COLUMN "responseTime",
ADD COLUMN     "response_time" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."one_time_codes" DROP COLUMN "expiresAt",
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."refresh_tokens" DROP COLUMN "hashedToken",
ADD COLUMN     "hashed_token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_hashed_token_key" ON "public"."refresh_tokens"("hashed_token");
