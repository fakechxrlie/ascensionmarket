import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const currentUserId = (session.user as any).id;

    const p = await params;
    const orderId = p.id;

    const bids = await prisma.bid.findMany({ where: { orderId } });
    
    const messages = await prisma.message.findMany({
      where: { orderId, threadBoosterId: { not: null } },
      include: { sender: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const boosterIds = new Set<string>();
    bids.forEach(b => boosterIds.add(b.boosterId));
    messages.forEach(m => boosterIds.add(m.threadBoosterId!));

    if (boosterIds.size === 0) {
      return NextResponse.json({ threads: [] });
    }

    const boosters = await prisma.user.findMany({
      where: { id: { in: Array.from(boosterIds) } },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        level: true,
        xp: true,
        slogan: true,
        reviewsReceived: {
          select: {
            rating: true,
            comment: true,
            buyer: { select: { username: true } }
          }
        }
      }
    });

    const threads = boosters.map(booster => {
      const bid = bids.find(b => b.boosterId === booster.id);
      const threadMsgs = messages.filter(m => m.threadBoosterId === booster.id);
      const lastMessage = threadMsgs.length > 0 ? { text: threadMsgs[0].text, createdAt: threadMsgs[0].createdAt } : null;
      const unreadCount = threadMsgs.filter(m => !m.isRead && m.senderId !== currentUserId).length;

      const ratingSum = booster.reviewsReceived.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = booster.reviewsReceived.length ? (ratingSum / booster.reviewsReceived.length).toFixed(1) : 'New';

      return {
        boosterId: booster.id,
        username: booster.username,
        avatarUrl: booster.avatarUrl,
        level: booster.level,
        xp: booster.xp,
        slogan: booster.slogan,
        rating: avgRating,
        reviewCount: booster.reviewsReceived.length,
        reviews: booster.reviewsReceived, // includes buyer { username }
        bidAmount: bid ? bid.amount : null,
        lastMessage,
        unreadCount
      };
    });

    // Sort by most recently active
    threads.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return NextResponse.json({ threads });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 });
  }
}
