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

    // Move to PENDING_COMPLETION and start 3-day timer
    await prisma.order.update({
      where: { id: bid.orderId },
      data: { status: 'PENDING_COMPLETION', completedAt: new Date() }
    });

    await sendAdminLog({
      title: '✅ JOB PENDING COMPLETION',
      description: `Order **${bid.order.id}** for **${bid.order.game}** has been marked complete by the Booster. Waiting for buyer confirmation or 3-day auto-release.`,
      color: 0xFFA500 // Orange
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to complete order' }, { status: 500 });
  }
}
