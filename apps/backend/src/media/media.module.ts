import { forwardRef, Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaRepository } from './media.repository';
import { mediaController } from './media.controller';
import { UserScopeModule } from 'src/user-scope/user-scope.module';
import { VenueModule } from 'src/venue/venue.module';

@Module({
  imports: [forwardRef(() => UserScopeModule), forwardRef(() => VenueModule)],
  providers: [MediaService, MediaRepository],
  exports: [MediaService, MediaRepository],
  controllers: [mediaController],
})
export class MediaModule {}
