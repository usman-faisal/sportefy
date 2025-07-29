import { Module, Global } from '@nestjs/common';
import { DrizzleProvider } from './providers/drizzle.provider';
import { UnitOfWork } from './services/unit-of-work.service';

@Global()
@Module({
  providers: [DrizzleProvider, UnitOfWork],
  exports: [DrizzleProvider, UnitOfWork],
})
export class CommonModule {}
