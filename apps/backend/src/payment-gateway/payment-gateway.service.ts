import { Injectable } from '@nestjs/common';
import { PaymentGatewayFactory } from './payment-gateway.factory';

@Injectable()
export class PaymentGatewayService {
    constructor(paymentGatewayFactory: PaymentGatewayFactory) {}

    

}
