-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- CreateTable
CREATE TABLE "integrations" (
    "hook_id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "github_webhook_secret" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("hook_id")
);

-- CreateTable
CREATE TABLE "discord_webhooks" (
    "discord_webhook_url" VARCHAR(255) NOT NULL,
    "hook_id" VARCHAR(255) NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "image" TEXT,
    "email_verified_at" TIMESTAMP(3),
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "stripe_price_id" TEXT,
    "stripe_subscription_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "access_token_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "one_time_codes" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "one_time_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integrations_name_key" ON "integrations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "discord_webhooks_discord_webhook_url_hook_id_key" ON "discord_webhooks"("discord_webhook_url", "hook_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "providers_provider_id_provider_account_id_key" ON "providers"("provider_id", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "one_time_codes_identifier_key" ON "one_time_codes"("identifier");

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discord_webhooks" ADD CONSTRAINT "discord_webhooks_hook_id_fkey" FOREIGN KEY ("hook_id") REFERENCES "integrations"("hook_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
