import { Info, Query, Resolver } from '@nestjs/graphql';
import { ProfileService } from './profile.service';
import { Profile } from '../generated/profile/profile.model';
import type { GraphQLResolveInfo } from 'graphql/type';
import { buildPrismaSelect } from '../shared/lib/prisma-select';

@Resolver()
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => Profile)
  profile(@Info() info: GraphQLResolveInfo) {
    const select = buildPrismaSelect(info);
    return this.profileService.find(select);
  }
}
