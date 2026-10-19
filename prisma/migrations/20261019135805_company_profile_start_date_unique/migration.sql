/*
  Warnings:

  - A unique constraint covering the columns `[profileId,companyId,startDate]` on the table `Experience` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,resourceId]` on the table `ProfileResource` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,skillId]` on the table `ProfileSkill` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Experience_companyId_profileId_idx";

-- DropIndex
DROP INDEX "ProfileResource_resourceId_profileId_key";

-- DropIndex
DROP INDEX "ProfileSkill_skillId_profileId_key";

-- CreateIndex
CREATE INDEX "Experience_companyId_idx" ON "Experience"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Experience_profileId_companyId_startDate_key" ON "Experience"("profileId", "companyId", "startDate");

-- CreateIndex
CREATE INDEX "ProfileResource_resourceId_idx" ON "ProfileResource"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileResource_profileId_resourceId_key" ON "ProfileResource"("profileId", "resourceId");

-- CreateIndex
CREATE INDEX "ProfileSkill_skillId_idx" ON "ProfileSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileSkill_profileId_skillId_key" ON "ProfileSkill"("profileId", "skillId");
