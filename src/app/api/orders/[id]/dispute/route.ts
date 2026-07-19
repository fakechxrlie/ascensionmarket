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
      include: { 
        bids: { where: { status: 'ACCEPTED' }, include: { booster: true } },
        buyer: true
      }
    });
    
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    
    // Verify caller is the buyer
    if (order.buyerId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized. You are not the buyer.' }, { status: 401 });
    }

    if (order.status !== 'IN_PROGRESS' && order.status !== 'PENDING_COMPLETION') {
      return NextResponse.json({ error: 'Order cannot be disputed in its current state.' }, { status: 400 });
    }

    // Freeze Order
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'DISPUTED' }
    });

    const boosterName = order.bids[0]?.booster?.username || 'Unknown Booster';

    await sendAdminLog({
      title: '🚨 ORDER DISPUTED!',
      description: `Buyer **${order.buyer.username}** has opened a dispute against Booster **${boosterName}** for Order **${order.id}**!`,
      color: 0xFF0000, // Red
      fields: [
        { name: 'Game', value: order.game, inline: true },
        { name: 'Escrow Amount', value: `$${order.escrowAmount.toFixed(2)}`, inline: true }
      ]
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to dispute order' }, { status: 500 });
  }
}
