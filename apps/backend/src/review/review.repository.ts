import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { NewReview, Review, reviews } from '@sportefy/db-types';
import { SQL, count, eq } from 'drizzle-orm';
import { DrizzleTransaction } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';
import { IncludeRelation, InferResultType } from 'src/database/utils';

// Define types for query inputs, mirroring the structure of VenueRepository
export type ReviewsWithInput = NonNullable<
  Parameters<DrizzleClient['query']['reviews']['findFirst']>[0]
>['with'];
export type ReviewsWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['reviews']['findFirst']>[0]
>['where'];
export type ReviewsUpdateWhereInput = SQL<unknown>;
export type ReviewsOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['reviews']['findMany']>[0]
>['orderBy'];

/**
 * @class ReviewRepository
 * @description A repository for interacting with the 'reviews' table in the database.
 * It provides a set of methods for CRUD operations and querying review data.
 */
@Injectable()
export class ReviewRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) readonly db: DrizzleClient) {
    super(db);
  }

  /**
   * Fetches a single review based on a where clause.
   * @param where - The conditions to filter the reviews.
   * @param withRelations - Optional relations to include in the result.
   * @param tx - Optional database transaction client.
   * @returns A single review object or undefined if not found.
   */
  async getReview<TWith extends IncludeRelation<'reviews'>>(
    where: ReviewsWhereInput,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'reviews', TWith> | undefined> {
    const dbClient = tx || this.db;
    const review = await dbClient.query.reviews.findFirst({
      where,
      with: withRelations,
    });

    return review;
  }

  /**
   * Fetches a single review by its unique ID.
   * @param reviewId - The UUID of the review.
   * @param withRelations - Optional relations to include in the result.
   * @param tx - Optional database transaction client.
   * @returns A single review object or undefined if not found.
   */
  async getReviewById<TWith extends IncludeRelation<'reviews'>>(
    reviewId: string,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'reviews', TWith> | undefined> {
    const dbClient = tx || this.db;
    const review = await dbClient.query.reviews.findFirst({
      where: (reviews, { eq }) => eq(reviews.id, reviewId),
      with: withRelations,
    });

    return review;
  }

  /**
   * Fetches multiple reviews based on various criteria.
   * @param where - The conditions to filter the reviews.
   * @param withRelations - Optional relations to include in the results.
   * @param limit - The maximum number of reviews to return.
   * @param offset - The number of reviews to skip.
   * @param orderBy - The order in which to sort the reviews.
   * @param tx - Optional database transaction client.
   * @returns An array of review objects.
   */
  async getManyReviews<TWith extends IncludeRelation<'reviews'>>(
    where: ReviewsWhereInput,
    withRelations?: TWith,
    limit?: number,
    offset?: number,
    orderBy?: ReviewsOrderByInput,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'reviews', TWith>[]> {
    const dbClient = tx || this.db;
    const reviewsList = await dbClient.query.reviews.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return reviewsList;
  }

  /**
   * Creates a new review in the database.
   * @param data - The data for the new review.
   * @param tx - Optional database transaction client.
   * @returns The newly created review object.
   */
  async createReview(
    data: NewReview,
    tx?: DrizzleTransaction,
  ): Promise<Review> {
    const dbClient = tx || this.db;
    const review = await dbClient.insert(reviews).values(data).returning();
    return review[0];
  }

  /**
   * Updates one or more reviews based on a where clause.
   * @param where - The condition to select which reviews to update.
   * @param data - The new data to update the reviews with.
   * @param tx - Optional database transaction client.
   * @returns An array of the updated review objects.
   */
  async updateReview(
    where: ReviewsUpdateWhereInput,
    data: Partial<NewReview>,
    tx?: DrizzleTransaction,
  ): Promise<Review[]> {
    const dbClient = tx || this.db;
    const updatedReview = await dbClient
      .update(reviews)
      .set(data)
      .where(where)
      .returning();

    return updatedReview;
  }

  /**
   * Updates a single review by its ID.
   * @param id - The UUID of the review to update.
   * @param data - The new data for the review.
   * @param tx - Optional database transaction client.
   * @returns An array containing the updated review object.
   */
  async updateReviewById(
    id: string,
    data: Partial<NewReview>,
    tx?: DrizzleTransaction,
  ): Promise<Review[]> {
    return this.updateReview(eq(reviews.id, id), data, tx);
  }

  /**
   * Deletes one or more reviews based on a where clause.
   * @param where - The condition to select which reviews to delete.
   * @param tx - Optional database transaction client.
   * @returns An array of the deleted review objects.
   */
  async deleteReview(
    where: ReviewsUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<Review[]> {
    const dbClient = tx || this.db;
    const deletedReview = await dbClient
      .delete(reviews)
      .where(where)
      .returning();

    return deletedReview;
  }

  /**
   * Deletes a single review by its ID.
   * @param id - The UUID of the review to delete.
   * @param tx - Optional database transaction client.
   * @returns An array containing the deleted review object.
   */
  async deleteReviewById(
    id: string,
    tx?: DrizzleTransaction,
  ): Promise<Review[]> {
    return this.deleteReview(eq(reviews.id, id), tx);
  }

  /**
   * Counts the total number of reviews, optionally filtered by a where clause.
   * @param where - The optional condition to filter the count.
   * @param tx - Optional database transaction client.
   * @returns The total number of reviews.
   */
  async count(
    where?: ReviewsUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<number> {
    const dbClient = tx || this.db;
    // Base query to count all items in the reviews table
    const query = dbClient.select({ count: count() }).from(reviews);

    // If a where clause is provided, apply it to the query
    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }

  async getReviewsByVenueId(
    venueId: string,
    withRelations?: IncludeRelation<'reviews'>,
    limit?: number,
    offset?: number,
    orderBy?: ReviewsOrderByInput,
    tx?: DrizzleTransaction,
  ): Promise<Review[]> {
    return this.getManyReviews(
      eq(reviews.venueId, venueId),
      withRelations,
      limit,
      offset,
      orderBy,
      tx,
    );
  }
}
