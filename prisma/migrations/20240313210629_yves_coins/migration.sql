-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "cost" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "coins" INTEGER NOT NULL DEFAULT 0;
