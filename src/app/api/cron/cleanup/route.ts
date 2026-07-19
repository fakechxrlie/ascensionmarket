import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Vercel Cron automatically sends a Bearer token matching CRON_SECRET if configured.
    // If you want strict security, uncomment this:
    /*
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    */

    // Delete orders older than 48 hours that are still OPEN
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const oldOrders = await prisma.order.findMany({
      where: {
        status: 'OPEN',
        createdAt: { lt: fortyEightHoursAgo }
      }
    });

    const orderIds = oldOrders.map(o => o.id);

    if (orderIds.length > 0) {
      await prisma.$transaction([
        prisma.message.deleteMany({ where: { orderId: { in: orderIds } } }),
        prisma.bid.deleteMany({ where: { orderId: { in: orderIds } } }),
        prisma.order.deleteMany({ where: { id: { in: orderIds } } })
      ]);
    }

    // --- AUTO RELEASE TIMER LOGIC ---
    // Release funds for orders in PENDING_COMPLETION where completedAt is older than 3 days
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING_COMPLETION',
        completedAt: { lt: threeDaysAgo }
      },
      include: { bids: { where: { status: 'ACCEPTED' } } }
    });

    let autoReleasedCount = 0;
    for (const po of pendingOrders) {
      const acceptedBid = po.bids[0];
      if (acceptedBid) {
        const payout = po.escrowAmount * 0.85;
        await prisma.$transaction([
          prisma.user.update({
            where: { id: acceptedBid.boosterId },
            data: { balance: { increment: payout } }
          }),
          prisma.order.update({
            where: { id: po.id },
            data: { status: 'COMPLETED', escrowAmount: 0 }
          })
        ]);
        autoReleasedCount++;
      }
    }

    // --- PENDING TRANSACTION CLEANUP ---
    // Mark PENDING transactions older than 6 hours as FAILED
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const expiredTransactions = await prisma.transaction.updateMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: sixHoursAgo }
      },
      data: { status: 'FAILED' }
    });

    return NextResponse.json({ 
      success: true, 
      deletedCount: orderIds.length,
      autoReleasedCount,
      expiredTransactionsCount: expiredTransactions.count
    }, { status: 200 });
  } catch (error) {
    console.error('CRON CLEANUP ERROR:', error);
    return NextResponse.json({ error: 'Failed to cleanup old orders' }, { status: 500 });
  }
}
