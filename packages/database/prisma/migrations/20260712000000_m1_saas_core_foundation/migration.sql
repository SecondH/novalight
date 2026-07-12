-- CreateEnum
CREATE TYPE "Vertical" AS ENUM ('BEAUTY_SALON', 'RESTAURANT', 'CAFE', 'LOCAL_SERVICE', 'RETAIL');

-- CreateEnum
CREATE TYPE "ApprovalState" AS ENUM ('DRAFT', 'EDITED', 'APPROVED', 'DISCARDED');

-- CreateEnum
CREATE TYPE "PostedState" AS ENUM ('SCHEDULED', 'POSTED', 'DISCARDED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "vertical" "Vertical" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "vertical" "Vertical" NOT NULL,
    "tone_descriptors" TEXT NOT NULL,
    "audience_description" TEXT NOT NULL,
    "visual_style_descriptors" TEXT NOT NULL,
    "offerings_summary" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_ideas" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "intended_format" TEXT NOT NULL,
    "target_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_ideas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_drafts" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "content_idea_id" TEXT NOT NULL,
    "caption_text" TEXT,
    "visual_prompt_text" TEXT,
    "approval_state" "ApprovalState" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_entries" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "content_draft_id" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "posted_state" "PostedState" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_owner_user_id_key" ON "accounts"("owner_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "brands_account_id_key" ON "brands"("account_id");

-- CreateIndex
CREATE INDEX "content_ideas_account_id_idx" ON "content_ideas"("account_id");

-- CreateIndex
CREATE INDEX "content_ideas_brand_id_idx" ON "content_ideas"("brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_drafts_content_idea_id_key" ON "content_drafts"("content_idea_id");

-- CreateIndex
CREATE INDEX "content_drafts_account_id_idx" ON "content_drafts"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_entries_content_draft_id_key" ON "calendar_entries"("content_draft_id");

-- CreateIndex
CREATE INDEX "calendar_entries_account_id_idx" ON "calendar_entries"("account_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_ideas" ADD CONSTRAINT "content_ideas_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_ideas" ADD CONSTRAINT "content_ideas_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_drafts" ADD CONSTRAINT "content_drafts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_drafts" ADD CONSTRAINT "content_drafts_content_idea_id_fkey" FOREIGN KEY ("content_idea_id") REFERENCES "content_ideas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_entries" ADD CONSTRAINT "calendar_entries_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_entries" ADD CONSTRAINT "calendar_entries_content_draft_id_fkey" FOREIGN KEY ("content_draft_id") REFERENCES "content_drafts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

