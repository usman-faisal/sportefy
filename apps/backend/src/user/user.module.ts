import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { ProfileModule } from 'src/profile/profile.module';
import { UserController } from './user.controller';

@Module({
  imports: [ProfileModule],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
  controllers: [UserController],
})
export class UserModule {}
