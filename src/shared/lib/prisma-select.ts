import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql/type';

export type PrismaSelect = { [key: string]: true | { select: PrismaSelect } };

export function fieldsToSelect(fields: Record<string, any>): PrismaSelect {
  const select: PrismaSelect = {};
  for (const [key, sub] of Object.entries(fields)) {
    if (key === '__typename') continue;
    select[key] = Object.keys(sub).length
      ? { select: fieldsToSelect(sub) }
      : true;
  }
  return select;
}

export function buildPrismaSelect(info: GraphQLResolveInfo) {
  return fieldsToSelect(graphqlFields(info));
}
