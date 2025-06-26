/*
  Warnings:

  - You are about to drop the column `mutedUntil` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `value` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.

*/
-- CreateEnum
CREATE TYPE "AlarmState" AS ENUM ('clearAlarm', 'initialAlarm', 'escalationAlarm');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "mutedUntil",
ADD COLUMN     "alarmState" "AlarmState" NOT NULL DEFAULT 'clearAlarm',
ADD COLUMN     "consecutiveNormalCount" INTEGER DEFAULT 0,
ALTER COLUMN "value" SET DATA TYPE DECIMAL(5,2);
