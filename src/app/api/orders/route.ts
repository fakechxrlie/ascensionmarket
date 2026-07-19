import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendOrderBiddingLog } from '@/lib/discord';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please login to post an order.' }, { status: 401 });
    }

    const body = await req.json();
    const { game, startRank, startDiv, startPts, targetRank, targetDiv, targetPts, options } = body;

    const order = await prisma.order.create({
      data: {
        game,
        startRank,
        startDiv,
        startPts,
        targetRank,
        targetDiv,
        targetPts,
        options: JSON.stringify(options),
        buyerId: (session.user as any).id,
      }
    });

    await sendOrderBiddingLog({
      title: '🚨 NEW ORDER POSTED FOR BIDDING!',
      description: `A new order has been posted for **${game}**!`,
      color: 0x00E676, // Green
      fields: [
        { name: 'Buyer', value: (session.user as any).name, inline: true },
        { name: 'Current Rank', value: `${startRank} ${startDiv || ''}`, inline: true },
        { name: 'Target Rank', value: `${targetRank} ${targetDiv || ''}`, inline: true }
      ]
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    
    if (role === 'BOOSTER' || role === 'OWNER') {
      const session = await getServerSession(authOptions);
      const userId = session?.user ? (session.user as any).id : null;

      const orders = await prisma.order.findMany({
        where: {
          OR: [
            { status: 'OPEN' },
            ...(userId ? [{ status: { in: ['IN_PROGRESS', 'PENDING_COMPLETION', 'DISPUTED'] }, bids: { some: { boosterId: userId, status: 'ACCEPTED' } } }] : [])
          ]
        },
        include: { 
          buyer: { select: { username: true } }, 
          bids: {
            include: { booster: { select: { username: true } } }
          }
        }
      });
      return NextResponse.json({ orders }, { status: 200 });
    } else {
      const orders = await prisma.order.findMany({
        where: { buyerId: (session.user as any).id },
        include: { bids: { include: { booster: { select: { username: true } } } } }
      });
      return NextResponse.json({ orders }, { status: 200 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
