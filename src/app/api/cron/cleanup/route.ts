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

    return NextResponse.json({ success: true, deletedCount: orderIds.length }, { status: 200 });
  } catch (error) {
    console.error('CRON CLEANUP ERROR:', error);
    return NextResponse.json({ error: 'Failed to cleanup old orders' }, { status: 500 });
  }
}
