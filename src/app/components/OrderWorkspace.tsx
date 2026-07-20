"use client";
import React, { useState, useEffect } from 'react';
import OrderChat from './OrderChat';

import BoosterProfileModal from './BoosterProfileModal';

export default function OrderWorkspace({ order, currentUserId, currentUsername, isBuyer, isBooster }: any) {
  const [threads, setThreads] = useState<any[]>([]);
  const [activeBoosterId, setActiveBoosterId] = useState<string | null>(isBooster ? currentUserId : null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [payingBidId, setPayingBidId] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // For Booster Bid Form
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const myBid = order.bids?.find((b: any) => b.boosterId === currentUserId);

  useEffect(() => {
    if (isBuyer) {
      fetchThreads();
      const int = setInterval(fetchThreads, 5000);
      return () => clearInterval(int);
    }
  }, [isBuyer, activeBoosterId]);

  const fetchThreads = async () => {
    const res = await fetch(`/api/orders/${order.id}/threads`);
    if (res.ok) {
      const data = await res.json();
      setThreads(data.threads);
      if (!activeBoosterId && data.threads.length > 0) {
        setActiveBoosterId(data.threads[0].boosterId);
      }
    }
  };

  const handleStripeCheckout = async (bidId: string) => {
    setStatusMsg(null);
    const res = await fetch(`/api/checkout/stripe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bidId })
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setStatusMsg({ text: 'Error: ' + data.error, isError: true });
  };

  const handleCryptoCheckout = async (bidId: string) => {
    setStatusMsg(null);
    const res = await fetch(`/api/checkout/crypto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bidId })
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setStatusMsg({ text: 'Error: ' + data.error, isError: true });
  };

  const placeBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidding(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(bidAmount) })
      });
      if (res.ok) window.location.reload();
      else {
        const data = await res.json();
        setStatusMsg({ text: data.error, isError: true });
        setBidding(false);
      }
    } catch (err) {
      setStatusMsg({ text: 'An error occurred.', isError: true });
      setBidding(false);
    }
  };

  const cancelBid = async (bidId: string) => {
    setBidding(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/bids`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidId })
      });
      if (res.ok) window.location.reload();
      else setBidding(false);
    } catch {
      setBidding(false);
    }
  };

  const activeThread = threads.find(t => t.boosterId === activeBoosterId);
  const activeBid = activeThread?.bidId ? { id: activeThread.bidId, amount: activeThread.bidAmount } : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', height: '600px' }}>
      
      {/* Profile Modal */}
      {showProfileModal && activeThread && (
        <BoosterProfileModal booster={activeThread} onClose={() => setShowProfileModal(false)} />
      )}

      {/* LEFT SIDEBAR */}
      <div className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {isBuyer ? (
          <>
            <div style={{ padding: '15px', borderBottom: '1px solid var(--border-light)', fontWeight: 600 }} className="font-mono">
              BOOSTERS ({threads.length})
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {threads.length === 0 ? (
                <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }} className="font-mono">
                  [WAITING FOR BOOSTERS...]
                </div>
              ) : (
                threads.map(t => {
                  const borderStyle = t.level >= 10 ? '2px double var(--brand)' : '1px solid var(--border-light)';
                  return (
                    <div 
                      key={t.boosterId} 
                      onClick={() => setActiveBoosterId(t.boosterId)}
                      style={{ 
                        padding: '15px', 
                        borderBottom: '1px solid var(--border-light)',
                        background: activeBoosterId === t.boosterId ? 'var(--bg-input)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'background 0.2s'
                      }}
                    >
                      {t.avatarUrl ? (
                        <img 
                          src={t.avatarUrl} 
                          alt={t.username} 
                          style={{ width: '40px', height: '40px', objectFit: 'cover', border: borderStyle }} 
                        />
                      ) : (
                        <div style={{ 
                          width: '40px', height: '40px', background: '#1c1d21', border: borderStyle,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--brand)'
                        }} className="font-mono">
                          {t.username.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{t.username}</span>
                          {t.unreadCount > 0 && (
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--brand)' }} />
                          )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', alignItems: 'center' }}>
                          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>{t.rating} ★</span>
                          <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                            {t.bidAmount ? <strong style={{ color: 'var(--brand)' }}>${t.bidAmount.toFixed(2)}</strong> : '-'}
                          </span>
                        </div>
                        {t.lastMessage && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {t.lastMessage.text}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : isBooster ? (
          <div style={{ padding: '20px' }}>
            <h3 className="font-mono" style={{ fontSize: '1rem', color: 'var(--brand)', marginBottom: '20px' }}>// YOUR BID</h3>
            {statusMsg && (
              <div className="font-mono" style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-secondary)', border: '1px solid var(--accent-secondary)', fontSize: '0.8rem', marginBottom: '15px' }}>
                {statusMsg.text}
              </div>
            )}
            
            {myBid ? (
              <div style={{ background: 'var(--bg-input)', padding: '15px', border: '1px solid var(--border-light)' }}>
                <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CURRENT BID</div>
                <div className="font-mono" style={{ fontSize: '1.5rem', color: 'var(--brand)', margin: '10px 0' }}>${myBid.amount.toFixed(2)}</div>
                <button onClick={() => cancelBid(myBid.id)} disabled={bidding} className="btn-primary" style={{ width: '100%', background: 'transparent', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)' }}>
                  {bidding ? 'CANCELLING...' : 'CANCEL BID'}
                </button>
              </div>
            ) : (
              <form onSubmit={placeBid}>
                <div className="input-group">
                  <label>BID AMOUNT (USD)</label>
                  <input type="number" step="0.01" min="1" value={bidAmount} onChange={e => setBidAmount(e.target.value)} required placeholder="e.g. 15.00" />
                </div>
                <button type="submit" disabled={bidding || !bidAmount} className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  {bidding ? 'PLACING BID...' : 'PLACE BID'}
                </button>
              </form>
            )}
          </div>
        ) : null}
      </div>

      {/* RIGHT MAIN AREA (CHAT & BID ACTION) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: '100%' }}>
        
        {isBuyer && activeBoosterId && activeThread && (
          <div className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {activeThread.avatarUrl ? (
                <img 
                  src={activeThread.avatarUrl} 
                  alt={activeThread.username} 
                  style={{ width: '45px', height: '45px', objectFit: 'cover', border: activeThread.level >= 10 ? '2px double var(--brand)' : '1px solid var(--border-light)', cursor: 'pointer' }} 
                  onClick={() => setShowProfileModal(true)}
                />
              ) : (
                <div 
                  onClick={() => setShowProfileModal(true)}
                  style={{ 
                    width: '45px', height: '45px', background: 'var(--bg-input)', border: activeThread.level >= 10 ? '2px double var(--brand)' : '1px solid var(--border-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--brand)', cursor: 'pointer'
                  }} className="font-mono">
                  {activeThread.username.slice(0, 2).toUpperCase()}
                </div>
              )}
              
              <div>
                <div 
                  className="font-mono" 
                  style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline decoration-var(--border-light)' }}
                  onClick={() => setShowProfileModal(true)}
                >
                  {activeThread.username}
                </div>
                <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span style={{ color: 'var(--accent)' }}>{activeThread.rating} ★</span> ({activeThread.reviewCount} reviews) • Bid: {activeThread.bidAmount ? <span style={{ color: 'var(--brand)' }}>${activeThread.bidAmount.toFixed(2)}</span> : 'None yet'}
                </div>
              </div>
            </div>
            
            {activeBid && (
              <div style={{ display: 'flex', gap: '10px' }}>
                {payingBidId === activeBid.id ? (
                  <>
                    <button onClick={() => handleStripeCheckout(activeBid.id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto', background: '#635BFF', borderColor: '#635BFF' }}>STRIPE</button>
                    <button onClick={() => handleCryptoCheckout(activeBid.id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto', background: '#f5a623', borderColor: '#f5a623', color: '#141517' }}>CRYPTO</button>
                    <button onClick={() => setPayingBidId(null)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto', background: 'transparent', borderColor: 'var(--border-light)', color: 'var(--text-muted)' }}>X</button>
                  </>
                ) : (
                  <button onClick={() => setPayingBidId(activeBid.id)} className="btn-primary" style={{ padding: '6px 20px', width: 'auto' }}>ACCEPT BID</button>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ flex: 1 }}>
          {activeBoosterId ? (
            <OrderChat 
              orderId={order.id} 
              boosterId={activeBoosterId} 
              currentUsername={currentUsername} 
              height="100%"
            />
          ) : (
            <div className="panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
              <p className="font-mono" style={{ color: 'var(--text-muted)' }}>[SELECT A THREAD TO CHAT]</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
