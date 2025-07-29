import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { ProfileRepository } from './profile.repository';

@Module({
  providers: [ProfileService, ProfileRepository],
  controllers: [ProfileController],
  exports: [ProfileRepository],
})
export class ProfileModule {}
