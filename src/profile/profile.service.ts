import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { PrismaSelect } from '../shared/lib/prisma-select';

@Injectable()
export class ProfileService {
  private logger = new Logger(ProfileService.name);

  constructor(private prisma: PrismaService) {}

  async find(select: PrismaSelect) {
    const profile = this.prisma.profile.findFirst({
      select,
      orderBy: { createdAt: 'desc' },
      relationLoadStrategy: 'join',
    });
    if (!profile) {
      throw new HttpException('Profile Not Found', HttpStatus.NOT_FOUND);
    }
    return profile;
  }
}
