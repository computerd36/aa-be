/*
  Warnings:

  - You are about to drop the column `alertLevel` on the `User` table. All the data in the column will be lost.
  - Added the required column `alertValue` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "alertLevel",
ADD COLUMN     "alertValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "metric" TEXT NOT NULL DEFAULT 'level';
