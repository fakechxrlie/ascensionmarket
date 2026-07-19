import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const p = await params;
    const body = await req.json();
    const { amount } = body;

    const bid = await prisma.bid.findUnique({
      where: { id: p.id }
    });

    if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    if (bid.boosterId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized. You do not own this bid.' }, { status: 401 });
    }

    const updated = await prisma.bid.update({
      where: { id: p.id },
      data: { amount: parseFloat(amount) }
    });

    return NextResponse.json({ success: true, bid: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update bid' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const p = await params;

    const bid = await prisma.bid.findUnique({
      where: { id: p.id }
    });

    if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    if (bid.boosterId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized. You do not own this bid.' }, { status: 401 });
    }

    await prisma.bid.delete({
      where: { id: p.id }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete bid' }, { status: 500 });
  }
}
