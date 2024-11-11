/*
  Warnings:

  - You are about to drop the column `llamaPort` on the `Settings` table. All the data in the column will be lost.
  - Added the required column `llamaApiUrl` to the `Settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "llamaPort",
ADD COLUMN     "llamaApiUrl" TEXT NOT NULL;
