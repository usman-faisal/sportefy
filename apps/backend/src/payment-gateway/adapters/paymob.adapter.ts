import { PaymentGateway } from "../payment-gateway.interface";

export class PaymobAdapter implements PaymentGateway {
    async processPayment(amount: number, currency: string, metadata?: any): Promise<string> {
        console.log(`Processing payment of ${amount} ${currency} with metadata:`, metadata);
        return "transaction_id"; // Return a mock transaction ID
    }
}