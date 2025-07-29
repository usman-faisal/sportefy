import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { VenueModule } from 'src/venue/venue.module';
import { ReviewRepository } from './review.repository';
import { MediaModule } from 'src/media/media.module';

@Module({
  imports: [VenueModule, MediaModule],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
})
export class ReviewModule {}
