import {
  PrismaClient,
  Profile,
  ProjectType,
  Role,
} from '../src/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { parse } from 'yaml';
import { readFileSync } from 'node:fs';
import { TransactionClient } from '../src/generated/prisma/internal/prismaNamespace';
import updateMany from '../src/shared/lib/update-many';

const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

interface YamlProfile extends Profile {
  resources: Array<{ name: string; url: string }>;
  skills: Array<string>;
  experience: Array<{
    company: string;
    position: string;
    description: string;
    startDate: string;
    endDate?: string;
  }>;
  projects: Array<{
    name: string;
    description?: string;
    problem?: string;
    solution?: string;
    type: ProjectType;
    url?: string;
    github?: string;
    role: Role;
  }>;
}

const yamlProfile: YamlProfile = parse(readFileSync('profile.yaml', 'utf-8'))[
  'profile'
];

async function upsertProfile(tx: TransactionClient) {
  const { firstName, lastName, jobTitle, description } = yamlProfile;
  const profile = await tx.profile.upsert({
    where: { firstName_lastName: { firstName, lastName } },
    update: { jobTitle, description },
    create: { firstName, lastName, jobTitle, description },
  });
  return profile.id;
}

async function upsertResources(tx: TransactionClient, profileId: number) {
  await tx.resource.createMany({
    data: yamlProfile.resources.map((resource) => ({ name: resource.name })),
    skipDuplicates: true,
  });
  const resourcesMap = Object.fromEntries(
    (await tx.resource.findMany()).map((resource) => [resource.name, resource.id]),
  );

  await tx.profileResource.createMany({
    data: yamlProfile.resources.map((resource) => ({
      resourceId: resourcesMap[resource.name],
      profileId,
      url: resource.url,
    })),
    skipDuplicates: true,
  });

  await updateMany(tx, {
    tableName: 'ProfileResource',
    uniqueFields: ['profileId', 'resourceId'],
    updateFields: ['url'],
    types: ['int', 'int', 'text'],
    values: yamlProfile.resources.map((resource) => [
      profileId,
      resourcesMap[resource.name],
      resource.url,
    ]),
  });

  await tx.profileResource.deleteMany({
    where: { profileId, resource: { name: { notIn: yamlProfile.resources.map(resource => resource.name)} } }
  })
}

async function upsertSkills(tx: TransactionClient, profileId: number) {
  await tx.skill.createMany({
    data: yamlProfile.skills.map((skill) => ({ name: skill })),
    skipDuplicates: true,
  });
  const skillsMap = Object.fromEntries(
    (await tx.skill.findMany()).map((skill) => [skill.name, skill.id]),
  );

  await tx.profileSkill.createMany({
    data: yamlProfile.skills.map((skill) => ({
      skillId: skillsMap[skill],
      profileId,
    })),
    skipDuplicates: true,
  });

  await tx.profileSkill.deleteMany({
    where: { profileId, skill: { name: { notIn: yamlProfile.skills } } },
  });
}

async function upsertExperience(tx: TransactionClient, profileId: number) {
  await tx.company.createMany({
    data: yamlProfile.experience.map((experience) => ({
      name: experience.company,
    })),
    skipDuplicates: true,
  });
  const companiesMap = Object.fromEntries(
    (await tx.company.findMany()).map((company) => [company.name, company.id]),
  );

  await tx.experience.createMany({
    data: yamlProfile.experience.map((experience) => ({
      companyId: companiesMap[experience.company],
      profileId,
      position: experience.position,
      description: experience.description,
      startDate: new Date(experience.startDate).toISOString(),
      endDate: experience.endDate ? new Date(experience.endDate).toISOString() : undefined,
    })),
    skipDuplicates: true,
  });

  await tx.experience.deleteMany({
    where: { profileId, company: { name: { notIn: yamlProfile.experience.map(experience => experience.company) } } },
  });
}

async function upsertProjects(tx: TransactionClient, profileId: number) {
  await tx.project.createMany({
    data: yamlProfile.projects.map((project) => ({
      profileId,
      name: project.name,
      description: project.description,
      type: project.type,
      url: project.url,
      github: project.github,
      role: project.role,
    })),
    skipDuplicates: true,
  });

  await updateMany(tx, {
    tableName: 'Project',
    uniqueFields: ['profileId', 'name'],
    updateFields: ['description', 'url', 'github'],
    types: ['int', 'text', 'text', 'text', 'text'],
    values: yamlProfile.projects.map((project) => [
      profileId,
      project.name,
      project.description,
      project.url,
      project.github
    ])
  });

  await tx.project.deleteMany({
    where: { profileId, name: { notIn: yamlProfile.projects.map(project => project.name) } },
  });
}

async function main() {
  await prisma.$transaction(async (tx) => {
    const profileId = await upsertProfile(tx);
    await upsertResources(tx, profileId);
    await upsertSkills(tx, profileId);
    await upsertExperience(tx, profileId);
    await upsertProjects(tx, profileId);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
