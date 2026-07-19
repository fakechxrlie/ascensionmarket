import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const amountStr = formData.get('amount') as string;
    const amount = parseFloat(amountStr);

    // Enforce the NOWPayments minimum transaction limit (typically $2 USD)
    if (isNaN(amount) || amount < 2) {
      return NextResponse.json({ error: 'Minimum deposit is $2.00 USD' }, { status: 400 });
    }

    // Create a pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: (session.user as any).id,
        amount,
        status: 'PENDING',
        method: 'CRYPTO'
      }
    });

    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Call NOWPayments Invoice API
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        order_id: transaction.id,
        order_description: `Ascension Wallet Credits ($${amount})`,
        ipn_callback_url: `${siteUrl}/api/wallet/webhook`,
        success_url: `${siteUrl}/dashboard?payment=success`,
        cancel_url: `${siteUrl}/wallet?payment=cancel`,
        // Force the invoice to expire after 1 hour (3600 seconds)
        lifetime: 3600
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('NOWPayments error:', data);
      return NextResponse.json({ error: data.message || 'Failed to create crypto invoice' }, { status: 500 });
    }

    // Save invoice ID to the transaction
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { invoiceId: data.id }
    });

    // Redirect user to NOWPayments hosted invoice checkout page
    return Response.redirect(data.invoice_url);
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Internal Server Error: ' + err.message }, { status: 500 });
  }
}
