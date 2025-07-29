import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from 'src/common/types';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Profile } from '@sportefy/db-types';
import { ReviewService } from './review.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { GetReviewsQuery } from './dto/get-reviews.dto';

/**
 * @class ReviewController
 * @description Handles HTTP requests related to reviews.
 * Endpoints are protected and require user authentication.
 */
@ApiTags('Review')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Get()
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all reviews.',
  })
  @ApiQuery({ type: GetReviewsQuery, required: true })
  async getReviews(@Query() query: GetReviewsQuery) {
    return this.reviewService.getReviews(query);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Post()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiBody({
    type: CreateReviewDto,
    required: true,
    description: 'Data for creating a new review',
  })
  @ApiResponse({
    status: 201,
    description: 'The review has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Venue not found.' })
  async createReview(
    @CurrentUser() user: Profile,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.createReview(user, createReviewDto);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Delete(':reviewId')
  @ApiOperation({ summary: 'Delete an existing review' })
  @ApiParam({
    name: 'reviewId',
    type: String,
    description: 'The ID of the review to delete',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: 200,
    description: 'The review has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found or user lacks permission.',
  })
  async deleteReview(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @CurrentUser() user: Profile,
  ) {
    return this.reviewService.deleteReview(reviewId, user);
  }
}
