import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        balance: { increment: 100 }
      }
    });

    return NextResponse.json({ success: true, balance: user.balance }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to deposit funds' }, { status: 500 });
  }
}
