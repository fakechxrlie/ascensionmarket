import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const p = await params;
    
    // Find the bid
    const bid = await prisma.bid.findUnique({
      where: { id: p.id },
      include: { order: true }
    });
    
    if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    
    // Verify user is the buyer
    if (bid.order.buyerId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized. You are not the buyer.' }, { status: 401 });
    }

    // Verify order is OPEN
    if (bid.order.status !== 'OPEN') {
      return NextResponse.json({ error: 'Order is no longer open.' }, { status: 400 });
    }

    // Fetch buyer to check balance
    const buyer = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
    if (!buyer || buyer.balance < bid.amount) {
      return NextResponse.json({ error: 'Insufficient funds. Please add money to your wallet.' }, { status: 400 });
    }

    // Perform Escrow Transaction
    await prisma.$transaction([
      // Deduct from buyer
      prisma.user.update({
        where: { id: buyer.id },
        data: { balance: { decrement: bid.amount } }
      }),
      // Accept Bid
      prisma.bid.update({
        where: { id: bid.id },
        data: { status: 'ACCEPTED' }
      }),
      // Move Order to IN_PROGRESS and add to escrow
      prisma.order.update({
        where: { id: bid.order.id },
        data: { status: 'IN_PROGRESS', escrowAmount: bid.amount }
      })
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to accept bid' }, { status: 500 });
  }
}
