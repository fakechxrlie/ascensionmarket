"use client";
import React, { useState } from 'react';
import OrderChat from './OrderChat';

export default function OrderBids({ orderId, bids, currentUsername }: any) {
  const [activeChatBoosterId, setActiveChatBoosterId] = useState<string | null>(null);
  
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const [payingBidId, setPayingBidId] = useState<string | null>(null);

  const handleStripeCheckout = async (bidId: string) => {
    setStatusMsg(null);
    const res = await fetch(`/api/checkout/stripe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bidId })
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setStatusMsg({ text: 'Error starting Stripe checkout: ' + data.error, isError: true });
    }
  };

  const handleCryptoCheckout = async (bidId: string) => {
    setStatusMsg(null);
    const res = await fetch(`/api/checkout/crypto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bidId })
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setStatusMsg({ text: 'Error starting Crypto checkout: ' + data.error, isError: true });
    }
  };

  const getXpBar = (xp: number) => {
    const max = 5000;
    const filled = Math.min(Math.floor((xp / max) * 12), 12);
    const empty = 12 - filled;
    return `XP: ${xp.toLocaleString()} / ${max.toLocaleString()} [${'|'.repeat(filled)}${'.'.repeat(empty)}]`;
  };

  if (bids.length === 0) {
    return <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '10px' }}>[WAITING FOR BOOSTERS TO PLACE BIDS...]</p>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: activeChatBoosterId ? '1.2fr 1.8fr' : '1fr', gap: '15px' }}>
      <div>
        {statusMsg && (
          <div className="font-mono" style={{
            padding: '8px 12px',
            background: statusMsg.isError ? 'rgba(239, 68, 68, 0.08)' : 'rgba(0, 230, 118, 0.08)',
            border: `1px solid ${statusMsg.isError ? 'var(--accent-secondary)' : 'var(--accent)'}`,
            color: statusMsg.isError ? 'var(--accent-secondary)' : 'var(--accent)',
            fontSize: '0.75rem',
            marginBottom: '10px'
          }}>
            [SYSTEM: {statusMsg.text.toUpperCase()}]
          </div>
        )}

        <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
          {bids.map((bid: any) => {
            const level = bid.booster.level || 1;
            const xp = bid.booster.xp || 0;
            const borderStyle = level >= 10 
              ? '3px double var(--brand)' 
              : '1px solid var(--border-light)';

            // Calculate aggregate ratings for each booster dynamically
            const ratings = bid.booster.reviewsReceived?.map((r: any) => r.rating) || [];
            const avgRating = ratings.length 
              ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) 
              : '0.0';
            const reviewCount = ratings.length;

            return (
              <li key={bid.id} style={{ display: 'flex', flexDirection: 'column', padding: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-light)', marginBottom: '10px' }}>
                
                {/* Booster Info Row */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                  {/* Square Profile Pic (Image fallback to initials) */}
                  {bid.booster.avatarUrl ? (
                    <img 
                      src={bid.booster.avatarUrl} 
                      alt={bid.booster.username} 
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        objectFit: 'cover', 
                        border: borderStyle 
                      }} 
                    />
                  ) : (
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      background: '#1c1d21', 
                      border: borderStyle,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      color: 'var(--brand)'
                    }} className="font-mono">
                      {bid.booster.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                      <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{bid.booster.username}</span>
                      <span className="font-mono" style={{ color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 600 }}>LVL {level}</span>
                      <span className="font-mono" style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600 }}>{avgRating} ★ ({reviewCount})</span>
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {getXpBar(xp)}
                    </div>
                  </div>
                </div>

                {/* Bid Details Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                  <span className="font-mono" style={{ fontSize: '0.85rem' }}>BID: <strong style={{ color: 'var(--accent)' }}>${bid.amount.toFixed(2)}</strong></span>
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => setActiveChatBoosterId(activeChatBoosterId === bid.boosterId ? null : bid.boosterId)} 
                      className="btn-primary" 
                      style={{ padding: '4px 10px', fontSize: '0.75rem', width: 'auto', background: activeChatBoosterId === bid.boosterId ? 'var(--bg-card)' : 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-light)' }}>
                      MSG
                    </button>
                    {payingBidId === bid.id ? (
                      <>
                        <button onClick={() => handleStripeCheckout(bid.id)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem', width: 'auto', background: '#635BFF', borderColor: '#635BFF' }}>STRIPE</button>
                        <button onClick={() => handleCryptoCheckout(bid.id)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem', width: 'auto', background: '#f5a623', borderColor: '#f5a623', color: '#141517' }}>CRYPTO</button>
                        <button onClick={() => setPayingBidId(null)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem', width: 'auto', background: 'transparent', borderColor: 'var(--border-light)', color: 'var(--text-muted)' }}>X</button>
                      </>
                    ) : (
                      <button onClick={() => setPayingBidId(bid.id)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem', width: 'auto' }}>ACCEPT</button>
                    )}
                  </div>
                </div>

              </li>
            );
          })}
        </ul>
      </div>
      {activeChatBoosterId && (
        <div>
          <OrderChat orderId={orderId} boosterId={activeChatBoosterId} currentUsername={currentUsername} />
        </div>
      )}
    </div>
  );
}
