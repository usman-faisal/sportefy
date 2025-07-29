import { FactoryProvider } from '@nestjs/common';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';
import * as schema from '@sportefy/db-types';
import { ConfigService } from '@nestjs/config';

export const DRIZZLE_CLIENT = 'DRIZZLE_CLIENT';
export type DrizzleClient = PostgresJsDatabase<typeof schema>;

export const DrizzleProvider: FactoryProvider = {
  provide: DRIZZLE_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const connectionString = configService.getOrThrow<string>('DATABASE_URL');
    const client = postgres(connectionString);
    return drizzle(client, { schema });
  },
};
