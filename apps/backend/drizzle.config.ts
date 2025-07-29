import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

const envFile =
  process.env.NODE_ENV === 'development' ? '.env.development' : '.env';
dotenv.config({ path: envFile });

export default {
  schema: './@sportefy/db-types/',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: process.env.NODE_ENV === 'development',
  strict: process.env.NODE_ENV === 'development',
} satisfies Config;
