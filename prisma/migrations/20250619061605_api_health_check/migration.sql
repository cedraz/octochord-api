-- CreateEnum
CREATE TYPE "APIStatus" AS ENUM ('UP', 'DOWN', 'PENDING');

-- CreateEnum
CREATE TYPE "HttpMethods" AS ENUM ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD');

-- CreateTable
CREATE TABLE "api_health_checks" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "APIStatus" NOT NULL,
    "last_checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interval" INTEGER NOT NULL DEFAULT 900,
    "method" "HttpMethods" NOT NULL DEFAULT 'GET',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "api_health_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integrations_hook_id_idx" ON "integrations"("hook_id");

-- AddForeignKey
ALTER TABLE "api_health_checks" ADD CONSTRAINT "api_health_checks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
