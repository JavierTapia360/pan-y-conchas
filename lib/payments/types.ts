export type CheckoutItem = { merchProductId: string; quantity: number; variantId?: string };
export type CheckoutRequest = { items: CheckoutItem[]; customerEmail: string; successUrl: string; cancelUrl: string };
export type CheckoutResult = { provider: 'stripe' | 'paypal'; checkoutUrl: string; reference: string };
export interface PaymentAdapter {
  createCheckout(request: CheckoutRequest): Promise<CheckoutResult>;
  confirmPayment(reference: string): Promise<{ paid: boolean }>;
  getPaymentStatus(reference: string): Promise<'pending' | 'paid' | 'failed'>;
}
