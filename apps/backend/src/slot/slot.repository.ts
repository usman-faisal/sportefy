import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { NewSlot, Slot, slots } from '@sportefy/db-types';
import { SQL, count, eq } from 'drizzle-orm';
import { DrizzleTransaction } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';
import { IncludeRelation, InferResultType } from 'src/database/utils';

export type SlotsWithInput = NonNullable<
  Parameters<DrizzleClient['query']['slots']['findFirst']>[0]
>['with'];
export type SlotsWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['slots']['findFirst']>[0]
>['where'];
export type SlotsUpdateWhereInput = SQL<unknown> | undefined;
export type SlotsOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['slots']['findMany']>[0]
>['orderBy'];

@Injectable()
export class SlotRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  async getSlot<TWith extends IncludeRelation<'slots'>>(
    where: SlotsWhereInput,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'slots', TWith> | undefined> {
    const dbClient = tx || this.db;
    const slot = await dbClient.query.slots.findFirst({
      where,
      with: withRelations,
    });

    return slot;
  }

  async getSlotById<TWith extends IncludeRelation<'slots'>>(
    slotId: string,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'slots', TWith> | undefined> {
    const dbClient = tx || this.db;
    const slot = await dbClient.query.slots.findFirst({
      where: (slots, { eq }) => eq(slots.id, slotId),
      with: withRelations,
    });

    return slot;
  }

  async getManySlots<TWith extends IncludeRelation<'slots'>>(
    where: SlotsWhereInput,
    withRelations?: TWith,
    limit?: number,
    offset?: number,
    orderBy?: SlotsOrderByInput,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'slots', TWith>[]> {
    const dbClient = tx || this.db;
    const slotsList = await dbClient.query.slots.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return slotsList;
  }

  async createSlot(data: NewSlot, tx?: DrizzleTransaction): Promise<Slot> {
    const dbClient = tx || this.db;
    const slot = await dbClient.insert(slots).values(data).returning();

    return slot[0];
  }

  async updateSlot(
    where: SlotsUpdateWhereInput,
    data: Partial<NewSlot>,
    tx?: DrizzleTransaction,
  ): Promise<Slot[]> {
    const dbClient = tx || this.db;
    const updatedSlot = await dbClient
      .update(slots)
      .set(data)
      .where(where)
      .returning();

    return updatedSlot;
  }

  async updateSlotById(
    id: string,
    data: Partial<NewSlot>,
    tx?: DrizzleTransaction,
  ): Promise<Slot[]> {
    return this.updateSlot(eq(slots.id, id), data, tx);
  }

  async deleteSlot(
    where: SlotsUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<Slot[]> {
    const dbClient = tx || this.db;
    const deletedSlot = await dbClient.delete(slots).where(where).returning();

    return deletedSlot;
  }

  async deleteSlotById(id: string, tx?: DrizzleTransaction): Promise<Slot[]> {
    return this.deleteSlot(eq(slots.id, id), tx);
  }

  async count(
    where?: SlotsUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<number> {
    const dbClient = tx || this.db;
    const query = dbClient.select({ count: count() }).from(slots);

    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }

  async getSlotsByVenueId<TWith extends IncludeRelation<'slots'>>(
    venueId: string,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'slots', TWith>[]> {
    const dbClient = tx || this.db;
    const venueSlots = await dbClient.query.slots.findMany({
      where: (slots, { eq }) => eq(slots.venueId, venueId),
      with: withRelations,
    });

    return venueSlots;
  }

  async getSlotsByEvent(
    eventType: 'booking' | 'maintenance',
    eventId: string,
    tx?: DrizzleTransaction,
  ): Promise<Slot[]> {
    const dbClient = tx || this.db;
    const eventSlots = await dbClient.query.slots.findMany({
      where: (slots, { and, eq }) =>
        and(eq(slots.eventType, eventType), eq(slots.eventId, eventId)),
    });

    return eventSlots;
  }
}
