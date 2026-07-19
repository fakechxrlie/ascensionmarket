import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export default async function BoosterHub() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      payoutRequests: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!user || (user.role !== 'BOOSTER' && user.role !== 'OWNER')) {
    redirect('/dashboard');
  }

  const userId = user.id;

  const activeJobs = await prisma.order.findMany({
    where: {
      status: { in: ['IN_PROGRESS', 'PENDING_COMPLETION'] },
      bids: { some: { boosterId: userId, status: 'ACCEPTED' } }
    },
    include: { buyer: true, bids: { where: { boosterId: userId, status: 'ACCEPTED' } } }
  });

  const pendingBids = await prisma.bid.findMany({
    where: { boosterId: userId, status: 'PENDING', order: { status: 'OPEN' } },
    include: { order: { include: { buyer: true } } }
  });

  // Pending Escrow = Total of active jobs payout (10% fee means they get 90%)
  const pendingEscrow = activeJobs.reduce((acc, job) => acc + (job.escrowAmount * 0.90), 0);

  // Completed Jobs = 
  const completedJobsCount = await prisma.order.count({
    where: { status: 'COMPLETED', bids: { some: { boosterId: userId, status: 'ACCEPTED' } } }
  });

  async function updatePayoutSettings(formData: FormData) {
    "use server";
    const method = formData.get('method') as string;
    const address = formData.get('address') as string;
    
    await prisma.user.update({
      where: { id: userId },
      data: { payoutMethod: method, payoutAddress: address }
    });
    revalidatePath('/booster');
  }

  async function requestPayout(formData: FormData) {
    "use server";
    const amount = parseFloat(formData.get('amount') as string);
    
    if (isNaN(amount) || amount < 10) return; // Minimum $10 payout

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser || currentUser.balance < amount) return;
    
    if (!currentUser.payoutMethod || !currentUser.payoutAddress) return;

    await prisma.$transaction([
      prisma.payoutRequest.create({
        data: {
          userId,
          amount,
          method: currentUser.payoutMethod,
          address: currentUser.payoutAddress
        }
      }),
      // We do NOT deduct the balance here. The Owner deducts it when marked as PAID.
      // Wait, standard practice is to deduct immediately so they can't double-spend. 
      // Let's deduct immediately and refund if rejected.
      prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: amount } }
      })
    ]);
    
    revalidatePath('/booster');
  }

  return (
    <main className="container" style={{ marginTop: '30px', marginBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px', marginBottom: '30px' }}>
        <div>
          <h1 className="font-mono" style={{ fontSize: '1.6rem', color: 'var(--brand)', margin: 0 }}>
            // BOOSTER COMMAND CENTER
          </h1>
          <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
            MANAGE ACTIVE JOBS, EARNINGS, AND PAYOUTS
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div className="panel" style={{ background: 'var(--bg-card)', padding: '20px', border: '1px solid var(--border-light)' }}>
          <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>AVAILABLE BALANCE</div>
          <strong className="font-mono" style={{ fontSize: '2rem', color: 'var(--brand)' }}>${user.balance.toFixed(2)}</strong>
        </div>
        <div className="panel" style={{ background: 'var(--bg-card)', padding: '20px', border: '1px solid var(--border-light)' }}>
          <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>PENDING ESCROW</div>
          <strong className="font-mono" style={{ fontSize: '2rem', color: 'var(--accent)' }}>${pendingEscrow.toFixed(2)}</strong>
        </div>
        <div className="panel" style={{ background: 'var(--bg-card)', padding: '20px', border: '1px solid var(--border-light)' }}>
          <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>COMPLETED JOBS</div>
          <strong className="font-mono" style={{ fontSize: '2rem', color: 'var(--text-main)' }}>{completedJobsCount}</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        
        {/* Left Side: Jobs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Active Jobs */}
          <div>
            <h2 className="font-mono" style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '15px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
              // ACTIVE JOBS ({activeJobs.length})
            </h2>
            {activeJobs.length === 0 ? (
              <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active jobs. Head to the Job Board to place some bids!</p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {activeJobs.map(job => (
                  <div key={job.id} className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--brand)', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 className="font-mono" style={{ margin: 0, fontSize: '1rem', color: 'var(--brand)' }}>{job.game}</h4>
                      <div className="font-mono" style={{ color: 'var(--text-main)', fontSize: '0.85rem', margin: '4px 0' }}>
                        From: {job.startRank} ➜ To: {job.targetRank}
                      </div>
                      <div className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        Buyer: {job.buyer.username} | Payout: ${(job.escrowAmount * 0.90).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <a href={`/orders/${job.id}`} className="btn-primary" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.75rem', width: 'auto', display: 'inline-block' }}>
                        ENTER WORKSPACE →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Bids */}
          <div>
            <h2 className="font-mono" style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '15px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
              // PENDING BIDS ({pendingBids.length})
            </h2>
            {pendingBids.length === 0 ? null : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {pendingBids.map(bid => (
                  <div key={bid.id} style={{ background: 'var(--bg-input)', border: '1px dashed var(--border-light)', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="font-mono" style={{ fontSize: '0.8rem' }}>
                      <strong style={{ color: 'var(--text-main)' }}>{bid.order.game}</strong> ({bid.order.startRank} ➜ {bid.order.targetRank})
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Bid: <strong style={{ color: 'var(--accent)' }}>${bid.amount.toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Payouts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px' }}>
            <h3 className="font-mono" style={{ margin: '0 0 15px 0', fontSize: '1rem', color: 'var(--brand)' }}>PAYOUT SETTINGS</h3>
            <form action={updatePayoutSettings} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label className="font-mono" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '5px' }}>PAYOUT METHOD</label>
                <select name="method" defaultValue={user.payoutMethod || ''} className="input-field" required>
                  <option value="" disabled>Select Method...</option>
                  <option value="Crypto (BTC)">Crypto (BTC)</option>
                  <option value="Crypto (ETH)">Crypto (ETH)</option>
                  <option value="Crypto (LTC)">Crypto (LTC)</option>
                  <option value="CashApp">CashApp</option>
                  <option value="PayPal">PayPal</option>
                </select>
              </div>
              <div>
                <label className="font-mono" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '5px' }}>PAYOUT ADDRESS / TAG</label>
                <input type="text" name="address" defaultValue={user.payoutAddress || ''} placeholder="Wallet address or $Cashtag" className="input-field" required />
              </div>
              <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', padding: '8px' }}>SAVE PREFERENCES</button>
            </form>
          </div>

          <div className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px' }}>
            <h3 className="font-mono" style={{ margin: '0 0 15px 0', fontSize: '1rem', color: 'var(--text-main)' }}>REQUEST WITHDRAWAL</h3>
            <form action={requestPayout} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label className="font-mono" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '5px' }}>AMOUNT TO WITHDRAW (Min $10)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span className="font-mono" style={{ fontSize: '1.2rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>$</span>
                  <input type="number" step="0.01" name="amount" min="10" max={user.balance} defaultValue={user.balance.toFixed(2)} className="input-field" required />
                </div>
              </div>
              
              {!user.payoutMethod || !user.payoutAddress ? (
                <div className="font-mono" style={{ color: 'var(--accent-secondary)', fontSize: '0.75rem', padding: '10px', border: '1px solid var(--accent-secondary)', background: 'rgba(239, 68, 68, 0.1)' }}>
                  Please save your Payout Settings above before requesting a withdrawal.
                </div>
              ) : (
                <button type="submit" disabled={user.balance < 10} className="btn-primary" style={{ fontSize: '0.8rem', padding: '8px', background: 'var(--accent)', borderColor: 'var(--accent)', color: '#141517' }}>
                  SUBMIT REQUEST
                </button>
              )}
            </form>
          </div>

          {user.payoutRequests.length > 0 && (
            <div>
              <h3 className="font-mono" style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>RECENT REQUESTS</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {user.payoutRequests.slice(0, 5).map(req => (
                  <div key={req.id} style={{ background: 'var(--bg-input)', padding: '10px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="font-mono" style={{ fontSize: '0.8rem' }}>
                      <strong style={{ color: 'var(--text-main)' }}>${req.amount.toFixed(2)}</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{new Date(req.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className="font-mono" style={{ 
                      fontSize: '0.7rem', 
                      padding: '2px 6px', 
                      border: '1px solid',
                      borderColor: req.status === 'PAID' ? 'var(--brand)' : req.status === 'REJECTED' ? 'var(--accent-secondary)' : 'var(--accent)',
                      color: req.status === 'PAID' ? 'var(--brand)' : req.status === 'REJECTED' ? 'var(--accent-secondary)' : 'var(--accent)'
                    }}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
