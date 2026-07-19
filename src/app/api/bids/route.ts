import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Usually only BOOSTER role can bid, but for testing purposes we can allow ADMIN or maybe temporarily anyone if they don't have the role.
    const role = (session.user as any).role;
    if (role !== 'BOOSTER' && role !== 'ADMIN') {
      // For the sake of prototyping without admin panel, we'll let users bypass this if needed, 
      // but strictly we should block. Let's block it so the user sees the real flow.
      return NextResponse.json({ error: 'Unauthorized. Only Boosters can bid.' }, { status: 401 });
    }

    const { orderId, amount } = await req.json();

    const bid = await prisma.bid.create({
      data: {
        amount,
        orderId,
        boosterId: (session.user as any).id,
      }
    });

    return NextResponse.json({ bid }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to place bid' }, { status: 500 });
  }
}
