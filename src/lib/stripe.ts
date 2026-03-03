import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export const TOKEN_PACKAGES = {
  starter: { price: 499, tokens: 50, name: 'Starter' },
  explorer: { price: 1299, tokens: 150, name: 'Explorer' },
  deep: { price: 2999, tokens: 400, name: 'Deep Dive' },
} as const;

export type PackageId = keyof typeof TOKEN_PACKAGES;
