import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PaymentRepository } from './payment.repository';

@Injectable()
export class PaymentSchedulerService {
  private readonly logger = new Logger(PaymentSchedulerService.name);

  constructor(private readonly paymentRepository: PaymentRepository) {}

  // Run every 10 minutes to clean up expired pending payments older than 1 hour
  @Cron('0 */10 * * * *')
  async removeExpiredPendingPayments() {
    const threshold = new Date(Date.now() - 60 * 60 * 1000);
    const removed = await this.paymentRepository.deleteExpiredPendingPayments(
      threshold,
    );
    if (removed > 0) {
      this.logger.log(`Deleted ${removed} expired pending payments`);
    }
  }
}



