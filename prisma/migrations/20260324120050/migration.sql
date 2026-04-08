-- CreateEnum
CREATE TYPE "ComponentStatus" AS ENUM ('DRAFT', 'SAVED');

-- AlterTable
ALTER TABLE "Component" ADD COLUMN     "status" "ComponentStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "Component_userId_status_idx" ON "Component"("userId", "status");
