import { DrizzleClient } from "src/common/providers/drizzle.provider";
import { DrizzleTransaction } from "src/database/types";

export abstract class BaseRepository {
    constructor(
        protected readonly db: DrizzleClient
    ) {
        this.db = db;
    }

    async transaction<T>(
        cb: (tx: DrizzleTransaction) => Promise<T>
    ): Promise<T> {
        return this.db.transaction(async (tx) => cb(tx));
    }
}