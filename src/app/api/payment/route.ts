import { NextRequest, NextResponse } from 'next/server';
import { getStripe, TOKEN_PACKAGES, type PackageId } from '@/lib/stripe';

export const maxDuration = 15;

export async function POST(request: NextRequest) {
  try {
    const { packageId, userId } = await request.json();
    const pkg = TOKEN_PACKAGES[packageId as PackageId];
    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: pkg.price,
      currency: 'usd',
      metadata: {
        userId,
        packageId,
        tokens: pkg.tokens.toString(),
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
