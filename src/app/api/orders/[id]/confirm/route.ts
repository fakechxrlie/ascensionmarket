import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendAdminLog } from '@/lib/discord';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const p = await params;
    
    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: p.id },
      include: { bids: { where: { status: 'ACCEPTED' } } }
    });
    
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    
    // Verify caller is the buyer
    if (order.buyerId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized. You are not the buyer.' }, { status: 401 });
    }

    if (order.status !== 'PENDING_COMPLETION') {
      return NextResponse.json({ error: 'Order is not pending completion.' }, { status: 400 });
    }

    const acceptedBid = order.bids[0];
    if (!acceptedBid) return NextResponse.json({ error: 'No booster assigned.' }, { status: 400 });

    const payout = order.escrowAmount * 0.85; // 15% platform fee

    // Complete Order Transaction
    await prisma.$transaction([
      // Pay Booster
      prisma.user.update({
        where: { id: acceptedBid.boosterId },
        data: { balance: { increment: payout } }
      }),
      // Complete Order
      prisma.order.update({
        where: { id: order.id },
        data: { status: 'COMPLETED', escrowAmount: 0 }
      })
    ]);

    await sendAdminLog({
      title: '✅ JOB COMPLETED & PAYOUT RELEASED',
      description: `Buyer has confirmed delivery for order **${order.id}** (${order.game}). Payout of **$${payout.toFixed(2)}** released to booster.`,
      color: 0x00E676
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to confirm delivery' }, { status: 500 });
  }
}
