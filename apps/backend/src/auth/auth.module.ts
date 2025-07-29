// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ProfileModule } from 'src/profile/profile.module';

@Module({
  imports: [PassportModule, JwtModule.register({}), ProfileModule],
  providers: [JwtStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
