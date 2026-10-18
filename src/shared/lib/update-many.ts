// https://gist.github.com/aalin/ea23b786e3d55329f6257c0f6576418b

import { PrismaClient } from '../../generated/prisma/client';
import { TransactionClient } from '../../generated/prisma/internal/prismaNamespace';

export default function updateMany(
  prisma: PrismaClient | TransactionClient,
  {
    tableName,
    uniqueFields,
    updateFields,
    types,
    values,
  }: {
    tableName: string;
    uniqueFields: string[];
    updateFields: string[];
    types: string[];
    values: unknown[][];
  },
) {
  const setSql = updateFields
    .map((field) => `"${field}" = "t"."${field}"`)
    .join(', ');
  const fieldsSql = [...uniqueFields, ...updateFields]
    .map((f) => `"${f}"`)
    .join(', ');

  let paramIndex = 0;
  const valuesSql = values
    .map(
      (row) =>
        `(${row.map((_, index) => `$${++paramIndex}::${types[index]}`)})`,
    )
    .join(',');

  const whereSql = uniqueFields
    .map((field) => `"${tableName}"."${field}" = "t"."${field}"`)
    .join(' AND ');

  const sql = `UPDATE "${tableName}" SET ${setSql} FROM (VALUES ${valuesSql}) AS t(${fieldsSql}) WHERE ${whereSql}`;
  console.log(sql);
  return prisma.$executeRawUnsafe(sql, ...values.flat());
}
