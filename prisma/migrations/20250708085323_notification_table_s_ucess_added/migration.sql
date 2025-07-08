/*
  Warnings:

  - Added the required column `success` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "success" BOOLEAN NOT NULL;
