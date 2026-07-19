import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { orderId, rating, comment } = body;

    const ratingVal = parseInt(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { bids: { where: { status: 'ACCEPTED' } }, review: true }
    });

    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    if (order.buyerId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized. You did not purchase this order.' }, { status: 401 });
    }
    if (order.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Reviews can only be submitted for completed orders.' }, { status: 400 });
    }
    if (order.review) {
      return NextResponse.json({ error: 'A review has already been submitted for this order.' }, { status: 400 });
    }

    const acceptedBid = order.bids[0];
    if (!acceptedBid) {
      return NextResponse.json({ error: 'No active booster found for this order.' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        rating: ratingVal,
        comment,
        orderId,
        boosterId: acceptedBid.boosterId,
        buyerId: (session.user as any).id
      }
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create review: ' + err.message }, { status: 500 });
  }
}
