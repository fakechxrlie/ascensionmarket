import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2026-06-24.dahlia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');
  let event;

  try {
    const rawBody = await request.text();
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } else {
      // Fallback for testing if webhook secret isn't configured yet
      event = JSON.parse(rawBody);
    }
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const bidId = session.metadata?.bidId;
    const orderId = session.metadata?.orderId;
    const buyerId = session.metadata?.buyerId;

    if (bidId && orderId && buyerId) {
      try {
        // Fetch the bid to ensure it exists and get the amount
        const bid = await prisma.bid.findUnique({ where: { id: bidId } });
        
        if (bid && bid.status === 'PENDING') {
          await prisma.$transaction([
            // Record the transaction
            prisma.transaction.create({
              data: {
                userId: buyerId,
                amount: bid.amount,
                method: 'STRIPE',
                status: 'COMPLETED',
                invoiceId: session.id,
                bidId: bid.id
              }
            }),
            // Accept Bid
            prisma.bid.update({
              where: { id: bid.id },
              data: { status: 'ACCEPTED' }
            }),
            // Move Order to IN_PROGRESS and add to escrow
            prisma.order.update({
              where: { id: orderId },
              data: { status: 'IN_PROGRESS', escrowAmount: bid.amount }
            })
          ]);
          console.log(`[Stripe Webhook] Successfully processed payment for Bid ${bidId}`);
        }
      } catch (dbErr) {
        console.error('[Stripe Webhook] Database transaction failed:', dbErr);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
