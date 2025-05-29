/*
  Warnings:

  - You are about to drop the column `alertValue` on the `User` table. All the data in the column will be lost.
  - Added the required column `value` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "alertValue",
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL;
