import { Injectable, NotFoundException } from '@nestjs/common';
import { media, NewMedia, Profile, reviews, venues } from '@sportefy/db-types';
import { CreateReviewDto } from './dto/create-review.dto';
import { VenueRepository } from 'src/venue/venue.repository';
import { UnitOfWork } from 'src/common/services/unit-of-work.service';
import { ReviewRepository } from './review.repository';
import { UserRole } from 'src/common/types';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { MediaRepository } from 'src/media/media.repository';
import { and, eq } from 'drizzle-orm';
import { GetReviewsQuery } from './dto/get-reviews.dto';

@Injectable()
export class ReviewService {
  constructor(
    private readonly venueRepository: VenueRepository,
    private readonly reviewRepository: ReviewRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly mediaRepository: MediaRepository,
  ) { }

  async getReviews(getReviewsQuery: GetReviewsQuery) {
    const { venueId, limit, offset, page } = getReviewsQuery;
    const venue = await this.venueRepository.getVenueById(venueId);

    if (!venue) {
      throw new NotFoundException('Venue not found');
    }

    const total = await this.reviewRepository.count(
      eq(reviews.venueId, venueId),
    );

    const data = await this.reviewRepository.getManyReviews(
      eq(reviews.venueId, venueId),
      {
        profile: { columns: { userName: true, avatarUrl: true } },
        media: true,
      },
      limit,
      offset,
    );

    const paginationLimit = limit || 10;
    const paginationPage = page || 1;

    const totalPages = Math.ceil(total / paginationLimit);
    const hasNext = paginationPage < totalPages;
    const hasPrev = paginationPage > 1;

    return ResponseBuilder.paginated(data, {
      page: paginationPage,
      limit: paginationLimit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    });
  }
  async createReview(user: Profile, createReviewDto: CreateReviewDto) {
    // venue exists
    const venue = await this.venueRepository.getVenueById(
      createReviewDto.venueId,
    );

    if (!venue) {
      throw new NotFoundException('Venue not found');
    }

    const result = await this.unitOfWork.do(async (tx) => {
      const newReview = {
        ...createReviewDto,
        userId: user.id,
      };

      const review = await this.reviewRepository.createReview(newReview, tx);

      // calculate the new average rating
      const averageRating = venue.rating
        ? Math.round((venue.rating * (venue.totalReviews ?? 0) + createReviewDto.rating) /
          ((venue.totalReviews ?? 0) + 1))
        : createReviewDto.rating;

      // Update the venue's average rating
      await this.venueRepository.updateVenueById(
        createReviewDto.venueId,
        { rating: averageRating, totalReviews: (venue.totalReviews ?? 0) + 1 },
        tx,
      );

      // If media is provided, handle it
      if (createReviewDto.media && createReviewDto.media.length > 0) {
        const mediaData: NewMedia[] = createReviewDto.media.map((media) => ({
          ...media,
          entityId: review.id,
          entityType: 'review',
        }));

        const media = await this.mediaRepository.createManyMedia(mediaData, tx);
        review['media'] = media;
      }
      return review;
    });
    return ResponseBuilder.success(result, 'Review created successfully');
  }

  async deleteReview(reviewId: string, user: Profile) {
    const review = await this.reviewRepository.getReviewById(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new NotFoundException('You can only delete your own reviews');
    }

    await this.unitOfWork.do(async (tx) => {
      Promise.all([
        this.reviewRepository.deleteReviewById(reviewId, tx),
        this.mediaRepository.deleteMedia(
          and(eq(media.entityId, reviewId), eq(media.entityType, 'review')),
          tx,
        ),
      ]);
    });

    return ResponseBuilder.deleted('Review deleted successfully');
  }
}
