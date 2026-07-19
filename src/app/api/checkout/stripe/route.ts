import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2026-06-24.dahlia',
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { bidId } = body;

    if (!bidId) {
      return NextResponse.json({ error: 'Missing bidId' }, { status: 400 });
    }

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { order: true }
    });

    if (!bid || bid.order.buyerId !== userId || bid.order.status !== 'OPEN') {
      return NextResponse.json({ error: 'Invalid bid or order status' }, { status: 400 });
    }

    // Determine absolute URL for success/cancel redirects
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Create a Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Boost Order: ${bid.order.game}`,
              description: `Escrow Payment for ${bid.order.startRank} to ${bid.order.targetRank}`,
            },
            unit_amount: Math.round(bid.amount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        bidId: bid.id,
        orderId: bid.orderId,
        buyerId: userId
      },
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/dashboard?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('STRIPE CHECKOUT ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
