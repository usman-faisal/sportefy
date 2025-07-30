import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { eq } from 'drizzle-orm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { profiles } from '@sportefy/db-types';
import { ProfileRepository } from 'src/profile/profile.repository';
import { Request } from 'express';

const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    const token = req.cookies['access-token'] ?? null;
    return token;
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @Inject(DRIZZLE_CLIENT)
    private db: DrizzleClient,
    private readonly profileRepository: ProfileRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const userId = payload.sub;
    const userProfile = await this.profileRepository.getProfile(
      eq(profiles.id, userId),
    );

    if (!userProfile) {
      throw new UnauthorizedException('User not found.');
    }

    return userProfile;
  }
}
