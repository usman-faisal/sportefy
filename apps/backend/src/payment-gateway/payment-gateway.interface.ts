export interface PaymentGateway {
  processPayment(amount: number, currency: string, metadata?: any): Promise<string>;
}
