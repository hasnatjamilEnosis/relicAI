/*
  Warnings:

  - Added the required column `llamaModel` to the `Settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `llamaPort` to the `Settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "llamaModel" TEXT NOT NULL,
ADD COLUMN     "llamaPort" TEXT NOT NULL;
