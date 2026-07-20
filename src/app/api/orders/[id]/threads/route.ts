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

    // Fetch all bids for this order
    const bids = await prisma.bid.findMany({
      where: { orderId },
      include: { 
        booster: { 
          select: { id: true, username: true, reviewsReceived: { select: { rating: true } } } 
        } 
      }
    });

    // Fetch all messages for this order to derive threads
    const messages = await prisma.message.findMany({
      where: { orderId, threadBoosterId: { not: null } },
      include: { sender: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const threadMap = new Map<string, any>();

    // 1. Add all boosters who have bidded
    for (const bid of bids) {
      if (!threadMap.has(bid.boosterId)) {
        const ratingSum = bid.booster.reviewsReceived.reduce((sum: number, r: any) => sum + r.rating, 0);
        const avgRating = bid.booster.reviewsReceived.length ? (ratingSum / bid.booster.reviewsReceived.length).toFixed(1) : 'New';
        
        threadMap.set(bid.boosterId, {
          boosterId: bid.boosterId,
          username: bid.booster.username,
          rating: avgRating,
          bidAmount: bid.amount,
          lastMessage: null,
          unreadCount: 0
        });
      }
    }

    // 2. Add/Update threads based on messages
    for (const msg of messages) {
      const bId = msg.threadBoosterId!;
      if (!threadMap.has(bId)) {
        threadMap.set(bId, {
          boosterId: bId,
          username: msg.senderId === bId ? msg.sender.username : 'Booster',
          rating: 'New', 
          bidAmount: null,
          lastMessage: null,
          unreadCount: 0
        });
      }

      const thread = threadMap.get(bId);
      
      // Since messages are sorted desc, the first one we see is the last message
      if (!thread.lastMessage) {
        thread.lastMessage = {
          text: msg.text,
          createdAt: msg.createdAt
        };
      }

      // Count unread (sent by someone else)
      if (!msg.isRead && msg.senderId !== currentUserId) {
        thread.unreadCount += 1;
      }
    }

    const threads = Array.from(threadMap.values());
    
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
