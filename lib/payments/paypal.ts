import type { CheckoutRequest, CheckoutResult, PaymentAdapter } from '@/lib/payments/types';

export class PayPalAdapter implements PaymentAdapter {
  async createCheckout(_request: CheckoutRequest): Promise<CheckoutResult> {
    if (!process.env.PAYPAL_CLIENT_SECRET) throw new Error('PAYPAL_SANDBOX_NOT_CONFIGURED');
    throw new Error('PAYPAL_ADAPTER_REQUIRES_APPROVED_MERCH_CATALOG');
  }
  async confirmPayment(_reference: string) { return { paid: false }; }
  async getPaymentStatus(_reference: string): Promise<'pending' | 'paid' | 'failed'> { return 'pending'; }
}
