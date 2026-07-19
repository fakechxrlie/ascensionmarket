import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const p = await params;
    
    // Find the accepted bid to verify ownership
    const bid = await prisma.bid.findFirst({
      where: { orderId: p.id, status: 'ACCEPTED' },
      include: { order: true }
    });
    
    if (!bid) return NextResponse.json({ error: 'No active accepted bid found for this order' }, { status: 404 });
    
    // Verify caller is the booster
    if (bid.boosterId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized. You are not the booster for this order.' }, { status: 401 });
    }

    if (bid.order.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Order is not in progress.' }, { status: 400 });
    }

    const payout = bid.order.escrowAmount * 0.85; // 15% platform fee

    // Complete Order Transaction
    await prisma.$transaction([
      // Pay Booster
      prisma.user.update({
        where: { id: bid.boosterId },
        data: { balance: { increment: payout } }
      }),
      // Complete Order
      prisma.order.update({
        where: { id: bid.orderId },
        data: { status: 'COMPLETED', escrowAmount: 0 }
      })
    ]);

    return NextResponse.json({ success: true, payout }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to complete order' }, { status: 500 });
  }
}
