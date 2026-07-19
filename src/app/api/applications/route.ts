import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { kycData, games, gameUsernames, skillProof } = body;

    // Check if user already has a pending application
    const existing = await prisma.boosterApplication.findFirst({
      where: { userId: (session.user as any).id, status: 'PENDING' }
    });

    if (existing) {
      return NextResponse.json({ error: 'You already have a pending application.' }, { status: 400 });
    }

    const application = await prisma.boosterApplication.create({
      data: {
        userId: (session.user as any).id,
        kycData: encrypt(kycData),
        games: JSON.stringify(games),
        gameUsernames: encrypt(JSON.stringify(gameUsernames)),
        skillProof: encrypt(skillProof)
      }
    });

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
