import { Module } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { PaymentGatewayFactory } from './payment-gateway.factory';

@Module({
  providers: [PaymentGatewayService, PaymentGatewayFactory]
})
export class PaymentGatewayModule {}
