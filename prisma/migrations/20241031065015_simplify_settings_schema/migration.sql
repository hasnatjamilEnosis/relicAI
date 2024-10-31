/*
  Warnings:

  - You are about to drop the `PreferredUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PreferredUser" DROP CONSTRAINT "PreferredUser_settingsId_fkey";

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "preferredUsers" TEXT[];

-- DropTable
DROP TABLE "PreferredUser";
