import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import OrderBids from '../components/OrderBids';
import { revalidatePath } from 'next/cache';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      reviewsReceived: { select: { rating: true } }
    }
  });

  if (!user) {
    redirect('/login');
  }

  const role = user.role;
  const userId = user.id;

  const orders = await prisma.order.findMany({
    where: { buyerId: userId },
    include: {
      review: true,
      bids: {
        include: { 
          booster: { 
            include: {
              reviewsReceived: { select: { rating: true } }
            }
          } 
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const getXpBar = (xp: number) => {
    const max = 5000;
    const filled = Math.min(Math.floor((xp / max) * 15), 15);
    const empty = 15 - filled;
    return `XP: ${xp.toLocaleString()} / ${max.toLocaleString()} [${'|'.repeat(filled)}${'.'.repeat(empty)}]`;
  };

  // Calculate self ratings (for boosters)
  const selfRatings = user.reviewsReceived.map(r => r.rating);
  const avgSelfRating = selfRatings.length ? (selfRatings.reduce((a, b) => a + b, 0) / selfRatings.length).toFixed(1) : '0.0';
  const selfReviewCount = selfRatings.length;

  const isHighLevelBooster = (user.role === 'BOOSTER' || user.role === 'OWNER') && (user.level || 1) >= 10;
  const boosterBorderStyle = isHighLevelBooster 
    ? '3px double var(--brand)' 
    : '1px solid var(--border-light)';

  // Server Action: Update profile picture
  async function updateAvatar(formData: FormData) {
    "use server";
    const avatarUrl = formData.get('avatarUrl') as string;
    const { prisma } = await import('@/lib/prisma');
    const { revalidatePath } = await import('next/cache');
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl }
    });
    revalidatePath('/dashboard');
  }

  // Server Action: Submit review
  async function submitReview(formData: FormData) {
    "use server";
    const orderId = formData.get('orderId') as string;
    const rating = parseInt(formData.get('rating') as string);
    const comment = formData.get('comment') as string;

    const { prisma } = await import('@/lib/prisma');
    const { revalidatePath } = await import('next/cache');

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { bids: { where: { status: 'ACCEPTED' } } }
    });

      if (order && order.status === 'COMPLETED' && order.bids[0]) {
      await prisma.review.create({
        data: {
          rating,
          comment,
          orderId,
          boosterId: order.bids[0].boosterId,
          buyerId: order.buyerId
        }
      });
      revalidatePath('/dashboard');
    }
  }

  // Server Action: Delete open order
  async function deleteOrder(formData: FormData) {
    "use server";
    const orderId = formData.get('orderId') as string;
    const { prisma } = await import('@/lib/prisma');
    const { revalidatePath } = await import('next/cache');
    
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order && order.buyerId === userId && order.status === 'OPEN') {
      await prisma.message.deleteMany({ where: { orderId } });
      await prisma.bid.deleteMany({ where: { orderId } });
      await prisma.order.delete({ where: { id: orderId } });
      revalidatePath('/dashboard');
    }
  }

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '30px', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px' }}>
        <div>
          <h1 className="font-mono" style={{ fontSize: '1.6rem', color: 'var(--text-main)', margin: 0 }}>
            // MY DASHBOARD
          </h1>
          <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
            Welcome back, {user.username} ({role})
          </p>
        </div>
        
        {/* Wallet Balance Card (Only visible for OWNER and BOOSTER) */}
        {(role === 'OWNER' || role === 'BOOSTER') && (
          <div style={{ background: 'var(--bg-card)', padding: '12px 18px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>PLATFORM EARNINGS</span>
            <strong className="font-mono" style={{ fontSize: '1.4rem', color: 'var(--brand)' }}>${user.balance.toFixed(2)}</strong>
          </div>
        )}
      </div>

      {/* Booster Progression & Profile Photo Settings */}
      {(role === 'BOOSTER' || role === 'OWNER') && (
        <div className="panel" style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {/* Square avatar (displays image if set) */}
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.username} 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  objectFit: 'cover', 
                  border: boosterBorderStyle 
                }} 
              />
            ) : (
              <div style={{ 
                width: '60px', 
                height: '60px', 
                background: 'var(--bg-input)', 
                border: boosterBorderStyle,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                color: 'var(--brand)'
              }} className="font-mono">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'baseline' }}>
                <h2 className="font-mono" style={{ fontSize: '1.1rem', margin: 0 }}>BOOSTER PROFILE: {user.username}</h2>
                <span className="font-mono" style={{ color: 'var(--brand)', fontWeight: 700, fontSize: '0.9rem' }}>LVL {user.level || 1}</span>
                <span className="font-mono" style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>{avgSelfRating} ★ ({selfReviewCount} reviews)</span>
              </div>
              <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', letterSpacing: '0.5px' }}>
                {getXpBar(user.xp || 0)}
              </div>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border-light)' }} />

          {/* Profile Photo Editor Form */}
          <form action={updateAvatar} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AVATAR URL:</span>
            <input 
              type="text" 
              name="avatarUrl" 
              placeholder="Paste image URL (e.g., https://...)" 
              defaultValue={user.avatarUrl || ''} 
              className="input-field" 
              style={{ flex: 1, margin: 0, padding: '6px 10px', fontSize: '0.8rem', height: '32px' }} 
            />
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '6px 15px', fontSize: '0.75rem', height: '32px' }}>
              SAVE PHOTO
            </button>
          </form>
        </div>
      )}

      {role === 'USER' && (
        <div style={{ marginTop: '20px' }}>
          <a href="/verify" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.8rem' }}>
              BECOME A BOOSTER
            </button>
          </a>
        </div>
      )}

      <div style={{ marginTop: '30px', marginBottom: '80px' }}>
        <h2 className="font-mono" style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px', marginBottom: '15px' }}>
          // MY ORDERS
        </h2>
        
        {orders.length === 0 ? (
          <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>You have not posted any orders yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {orders.map(order => (
              <div key={order.id} className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <h3 className="font-mono" style={{ margin: 0, fontSize: '0.95rem' }}>{order.game}</h3>
                    <span className="font-mono" style={{ 
                      padding: '2px 8px', 
                      border: '1px solid var(--border-light)', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      color: order.status === 'OPEN' ? 'var(--brand)' : order.status === 'IN_PROGRESS' || order.status === 'PENDING_COMPLETION' ? 'var(--accent)' : order.status === 'DISPUTED' ? 'var(--accent-secondary)' : 'var(--text-muted)'
                    }}>{order.status}</span>
                  </div>
                  {order.status === 'OPEN' && (
                    <form action={deleteOrder}>
                      <input type="hidden" name="orderId" value={order.id} />
                      <button type="submit" className="font-mono" style={{ background: 'transparent', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)', padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}>
                        DELETE ORDER
                      </button>
                    </form>
                  )}
                </div>
                <p className="font-mono" style={{ margin: '8px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  From: <strong>{order.startRank} {order.startDiv}</strong> ➜ To: <strong>{order.targetRank} {order.targetDiv}</strong>
                </p>
                
                {/* Completed Order Reviews Block */}
                {order.status === 'COMPLETED' && (
                  <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '12px', paddingTop: '12px' }}>
                    {order.review ? (
                      <div className="font-mono" style={{ background: 'var(--bg-input)', padding: '10px 15px', border: '1px solid var(--border-light)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>YOUR RATING: {order.review.rating} ★</span>
                        {order.review.comment && <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>"{order.review.comment}"</p>}
                      </div>
                    ) : (
                      <div style={{ background: 'var(--bg-input)', padding: '12px 18px', border: '1px dashed var(--border-light)' }}>
                        <h4 className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--brand)', marginBottom: '10px' }}>LEAVE BOOSTER FEEDBACK</h4>
                        <form action={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RATING:</span>
                            <select name="rating" className="input-field" style={{ width: '80px', height: '28px', padding: '0 4px', fontSize: '0.75rem', margin: 0 }}>
                              <option value="5">5 ★</option>
                              <option value="4">4 ★</option>
                              <option value="3">3 ★</option>
                              <option value="2">2 ★</option>
                              <option value="1">1 ★</option>
                            </select>
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="text" name="comment" placeholder="Write a feedback comment..." className="input-field" style={{ flex: 1, margin: 0, padding: '4px 8px', fontSize: '0.75rem', height: '28px' }} />
                            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 15px', fontSize: '0.75rem', height: '28px' }}>SUBMIT REVIEW</button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* Dispute & Confirm Buttons for In-Progress/Pending orders */}
                {(order.status === 'IN_PROGRESS' || order.status === 'PENDING_COMPLETION') && (
                  <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '12px', paddingTop: '12px' }}>
                    {order.status === 'PENDING_COMPLETION' && (
                      <div style={{ padding: '8px 12px', background: 'rgba(0, 230, 118, 0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '0.8rem', marginBottom: '10px' }} className="font-mono">
                        Booster marked this complete! Please confirm delivery to release funds, or open a dispute if incomplete. (Funds auto-release after 3 days).
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={async () => {
                        if (confirm('Are you sure you want to dispute this order? Funds will be frozen and Admin will be alerted.')) {
                          await fetch(`/api/orders/${order.id}/dispute`, { method: 'POST' });
                          window.location.reload();
                        }
                      }} className="btn-primary" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.7rem', background: 'transparent', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)' }}>
                        DISPUTE ORDER
                      </button>

                      {order.status === 'PENDING_COMPLETION' && (
                        <button onClick={async () => {
                          if (confirm('Release funds to booster and complete job?')) {
                            await fetch(`/api/orders/${order.id}/confirm`, { method: 'POST' });
                            window.location.reload();
                          }
                        }} className="btn-primary" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.7rem' }}>
                          CONFIRM DELIVERY
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {order.status === 'OPEN' && (
                  <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '12px', paddingTop: '12px' }}>
                    <h4 className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>RECEIVED BIDS ({order.bids.length})</h4>
                    <OrderBids orderId={order.id} bids={order.bids} currentUsername={user.username} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
