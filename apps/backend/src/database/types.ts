import { SQL } from 'drizzle-orm';
import { DrizzleClient } from '../common/providers/drizzle.provider'; // Or wherever you export your main Drizzle client type from

type TransactionCallback = Parameters<DrizzleClient['transaction']>[0];

export type DrizzleTransaction = Parameters<TransactionCallback>[0];

export type SqlUnknown = SQL<unknown> | undefined;
