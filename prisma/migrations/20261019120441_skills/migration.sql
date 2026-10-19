/*
  Warnings:

  - You are about to drop the column `profileId` on the `Skill` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_profileId_fkey";

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "profileId";
