import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { DrizzleTransaction } from 'src/database/types';

@Injectable()
export class UnitOfWork {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleClient) {}

  /**
   * Executes a callback within a database transaction.
   * @param cb The callback function to execute. It receives the transaction client.
   * @returns The result of the callback.
   */
  async do<T>(cb: (tx: DrizzleTransaction) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx) => cb(tx));
  }
}
