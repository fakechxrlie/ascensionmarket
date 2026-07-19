import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();
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

    // Create a pending transaction linked to the bid
    const transaction = await prisma.transaction.create({
      data: {
        userId: userId,
        amount: bid.amount,
        status: 'PENDING',
        method: 'CRYPTO',
        bidId: bid.id
      }
    });

    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    
    // Determine absolute URL for success/cancel redirects
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const siteUrl = `${protocol}://${host}`;
    
    // Call NOWPayments Invoice API
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: bid.amount,
        price_currency: 'usd',
        order_id: transaction.id,
        order_description: `Escrow Payment for Boost Order (${bid.order.startRank} -> ${bid.order.targetRank})`,
        ipn_callback_url: `${siteUrl}/api/webhooks/crypto`,
        success_url: `${siteUrl}/dashboard?payment=success`,
        cancel_url: `${siteUrl}/dashboard?payment=cancel`,
        // Force the invoice to expire after 1 hour (3600 seconds)
        lifetime: 3600
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('NOWPayments error:', data);
      return NextResponse.json({ error: data.message || 'Failed to create crypto invoice' }, { status: 500 });
    }

    // Save invoice ID to the transaction
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { invoiceId: data.id }
    });

    return NextResponse.json({ url: data.invoice_url });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Internal Server Error: ' + err.message }, { status: 500 });
  }
}
