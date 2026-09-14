export const COMMERCE_CONFIG = { merch: true, cannabis: false } as const;
export const COMMERCE_ENABLED = COMMERCE_CONFIG.cannabis;

export const futurePaymentMethods = ['card', 'apple-pay', 'paypal'] as const;
