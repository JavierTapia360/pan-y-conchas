import type { CheckoutRequest, CheckoutResult, PaymentAdapter } from '@/lib/payments/types';

export class StripeAdapter implements PaymentAdapter {
  async createCheckout(_request: CheckoutRequest): Promise<CheckoutResult> {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SANDBOX_NOT_CONFIGURED');
    throw new Error('STRIPE_ADAPTER_REQUIRES_APPROVED_MERCH_CATALOG');
  }
  async confirmPayment(_reference: string) { return { paid: false }; }
  async getPaymentStatus(_reference: string): Promise<'pending' | 'paid' | 'failed'> { return 'pending'; }
}
