import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const p = await params;
    const { searchParams } = new URL(req.url);
    const boosterId = searchParams.get('boosterId');

    if (!boosterId) return NextResponse.json({ error: 'boosterId is required' }, { status: 400 });

    const markRead = searchParams.get('markRead') === 'true';

    const messages = await prisma.message.findMany({
      where: { orderId: p.id, threadBoosterId: boosterId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { username: true, role: true } } }
    });

    if (markRead) {
      // Mark all unread messages in this thread NOT sent by the current user as read
      await prisma.message.updateMany({
        where: {
          orderId: p.id,
          threadBoosterId: boosterId,
          senderId: { not: (session.user as any).id },
          isRead: false
        },
        data: { isRead: true }
      });
    }

    return NextResponse.json({ messages });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const p = await params;
    const { searchParams } = new URL(req.url);
    const boosterId = searchParams.get('boosterId');

    if (!boosterId) return NextResponse.json({ error: 'boosterId is required' }, { status: 400 });

    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });

    const message = await prisma.message.create({
      data: {
        text,
        orderId: p.id,
        senderId: (session.user as any).id,
        threadBoosterId: boosterId
      },
      include: { sender: { select: { username: true, role: true } } }
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
