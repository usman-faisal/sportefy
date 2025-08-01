import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

export default {
  schema: '../../packages/db-types/src/*.schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DEV_DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
