import { Injectable } from '@nestjs/common';
import { PaymentGateway } from './payment-gateway.interface';
import { ConfigService } from '@nestjs/config';
import { PaymobAdapter } from './adapters/paymob.adapter';

@Injectable()
export class PaymentGatewayFactory {
    protected paymentGateway: PaymentGateway;
    constructor(private readonly configService: ConfigService) {
        const gatewayType = this.configService.get<string>('PAYMENT_GATEWAY_TYPE') || 'paymob'; // Default to 'paymob' if not set
        if (!gatewayType) {
            throw new Error('PAYMENT_GATEWAY_TYPE is not defined in the configuration');
        }

        this.paymentGateway = this.getGateway(gatewayType);
    }

    getGateway(gatewayType: string): PaymentGateway {
        switch (gatewayType) {
            case 'paymob':
                return new PaymobAdapter();
            default:
                throw new Error(`Unsupported payment gateway: ${gatewayType}`);
        }
    }
}
