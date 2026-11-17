-- AlterTable
ALTER TABLE "users" ADD COLUMN "clerk_user_id" TEXT,
ADD COLUMN "deactivated_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_user_id_key" ON "users"("clerk_user_id");
