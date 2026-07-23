-- AlterTable
ALTER TABLE "users" ADD COLUMN "googleId" TEXT;
ALTER TABLE "users" ADD COLUMN "provider" TEXT;
ALTER TABLE "users" ADD COLUMN "avatar" TEXT;
ALTER TABLE "users" ADD COLUMN "lastLogin" TIMESTAMP(6);

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");