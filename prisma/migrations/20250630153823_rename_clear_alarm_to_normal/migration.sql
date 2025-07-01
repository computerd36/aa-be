/*
  Warnings:

  - The values [clearAlarm] on the enum `AlarmState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AlarmState_new" AS ENUM ('normal', 'initialAlarm', 'escalationAlarm');
ALTER TABLE "User" ALTER COLUMN "alarmState" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "alarmState" TYPE "AlarmState_new" USING ("alarmState"::text::"AlarmState_new");
ALTER TYPE "AlarmState" RENAME TO "AlarmState_old";
ALTER TYPE "AlarmState_new" RENAME TO "AlarmState";
DROP TYPE "AlarmState_old";
ALTER TABLE "User" ALTER COLUMN "alarmState" SET DEFAULT 'normal';
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "alarmState" SET DEFAULT 'normal';
