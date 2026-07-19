import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    const sig = req.headers.get('x-nowpayments-sig');
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

    // Signature Verification (only if IPN Secret is configured in production)
    if (ipnSecret && sig) {
      const hmac = crypto.createHmac('sha512', ipnSecret);
      hmac.update(JSON.stringify(body, Object.keys(body).sort()));
      const digest = hmac.digest('hex');
      if (digest !== sig) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const { payment_status, order_id } = body;

    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: order_id }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status === 'COMPLETED') {
      return NextResponse.json({ message: 'Transaction already completed' }, { status: 200 });
    }

    if (payment_status === 'finished') {
      // It's a Bid checkout. Accept the Bid and move Order to IN_PROGRESS.
      if (transaction.bidId) {
        const bid = await prisma.bid.findUnique({
          where: { id: transaction.bidId },
          include: { order: true }
        });

        if (bid && bid.status === 'PENDING') {
          await prisma.$transaction([
            prisma.transaction.update({
              where: { id: transaction.id },
              data: { status: 'COMPLETED' }
            }),
            prisma.bid.update({
              where: { id: bid.id },
              data: { status: 'ACCEPTED' }
            }),
            prisma.order.update({
              where: { id: bid.orderId },
              data: { status: 'IN_PROGRESS', escrowAmount: bid.amount }
            })
          ]);
        }
      }
    } else if (['failed', 'expired'].includes(payment_status)) {
      await prisma.transaction.update({
        where: { id: order_id },
        data: { status: 'FAILED' }
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
