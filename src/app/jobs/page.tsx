"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import OrderChat from '../components/OrderChat';

export default function JobBoard() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterGame, setFilterGame] = useState('ALL');
  
  // Expanded card tracking
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
  // Custom Inline Notification Toast State
  const [notify, setNotify] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  // Inline editing states
  const [editingBidId, setEditingBidId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  // Inline delete confirmation states
  const [confirmDeleteBidId, setConfirmDeleteBidId] = useState<string | null>(null);

  const showNotify = (msg: string, type: 'success' | 'error') => {
    setNotify({ msg, type });
    setTimeout(() => setNotify(null), 5000);
  };

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else if (data.orders) setOrders(data.orders);
        setLoading(false);
      });
  }, []);

  const placeBid = async (orderId: string, amount: number) => {
    if (isNaN(amount) || amount <= 0) {
      showNotify('Bid amount must be greater than $0.00', 'error');
      return;
    }

    const res = await fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount })
    });
    if (res.ok) {
      showNotify('Bid placed successfully!', 'success');
      // Reload orders
      const ordersRes = await fetch('/api/orders').then(r => r.json());
      if (ordersRes.orders) setOrders(ordersRes.orders);
    } else {
      showNotify('Failed to place bid. Ensure you are registered as a BOOSTER.', 'error');
    }
  };

  const updateBid = async (bidId: string, amount: number) => {
    if (isNaN(amount) || amount <= 0) {
      showNotify('Bid amount must be greater than $0.00', 'error');
      return;
    }

    const res = await fetch(`/api/bids/${bidId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    if (res.ok) {
      showNotify('Bid updated successfully!', 'success');
      setEditingBidId(null);
      // Reload orders
      const ordersRes = await fetch('/api/orders').then(r => r.json());
      if (ordersRes.orders) setOrders(ordersRes.orders);
    } else {
      showNotify('Failed to update bid.', 'error');
    }
  };

  const deleteBid = async (bidId: string) => {
    const res = await fetch(`/api/bids/${bidId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      showNotify('Bid deleted successfully!', 'success');
      setConfirmDeleteBidId(null);
      // Reload orders
      const ordersRes = await fetch('/api/orders').then(r => r.json());
      if (ordersRes.orders) setOrders(ordersRes.orders);
    } else {
      showNotify('Failed to delete bid.', 'error');
    }
  };

  const completeJob = async (orderId: string) => {
    const res = await fetch(`/api/orders/${orderId}/complete`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showNotify(`Job Complete! $${data.payout.toFixed(2)} has been added to your Wallet.`, 'success');
      // Reload orders
      const ordersRes = await fetch('/api/orders').then(r => r.json());
      if (ordersRes.orders) setOrders(ordersRes.orders);
    } else {
      showNotify('Error completes job: ' + data.error, 'error');
    }
  };

  return (
    <main className="container">
      <div style={{ marginTop: '40px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        <h1 className="font-mono" style={{ fontSize: '1.6rem', color: 'var(--brand)', margin: 0 }}>
          // JOB BOARD (BOOSTERS ONLY)
        </h1>
        <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
          BROWSE ACTIVE ORDERS, CHAT WITH BUYERS, AND PLACE YOUR BIDS
        </p>
      </div>

      {/* Custom Tactical Notification Toast */}
      {notify && (
        <div className="font-mono" style={{
          marginTop: '20px',
          padding: '12px 16px',
          background: notify.type === 'success' ? 'rgba(0, 230, 118, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `1px solid ${notify.type === 'success' ? 'var(--accent)' : 'var(--accent-secondary)'}`,
          color: notify.type === 'success' ? 'var(--accent)' : 'var(--accent-secondary)',
          fontSize: '0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>[SYSTEM STATUS: {notify.msg.toUpperCase()}]</span>
          <button onClick={() => setNotify(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>[X]</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
        {['ALL', 'Valorant', 'Apex Legends', 'Rainbow 6 Siege', 'Rocket League', 'Fortnite'].map(game => (
          <button 
            key={game}
            onClick={() => setFilterGame(game)}
            className="font-mono"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              background: filterGame === game ? 'rgba(0, 230, 118, 0.1)' : 'transparent',
              color: filterGame === game ? 'var(--brand)' : 'var(--text-muted)',
              border: `1px solid ${filterGame === game ? 'var(--brand)' : 'var(--border-light)'}`,
              transition: 'all 0.2s'
            }}
          >
            {game === 'ALL' ? 'ALL GAMES' : game.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-mono" style={{ marginTop: '30px', fontSize: '0.85rem' }}>Loading open orders...</p>
      ) : error ? (
        <p className="font-mono" style={{ marginTop: '30px', color: 'var(--accent-secondary)', fontSize: '0.85rem' }}>{error}</p>
      ) : (
        <div style={{ marginTop: '25px', marginBottom: '80px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {orders.filter((order: any) => filterGame === 'ALL' || order.game === filterGame).map((order: any) => {
            const isExpanded = expandedOrder === order.id;
            const options = JSON.parse(order.options || "[]");
            return (
              <div key={order.id} className="panel" style={{ background: 'var(--bg-card)', padding: '16px', border: '1px solid var(--border-light)', cursor: 'pointer', transition: 'border-color 0.15s' }} onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 className="font-mono" style={{ margin: 0, fontSize: '1rem' }}>{order.game}</h3>
                    {order.status === 'IN_PROGRESS' && (
                      <span className="font-mono" style={{ background: 'var(--brand)', color: '#141517', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 700 }}>
                        ACTIVE JOB
                      </span>
                    )}
                    {order.status === 'PENDING_COMPLETION' && (
                      <span className="font-mono" style={{ background: 'var(--accent)', color: '#141517', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 700 }}>
                        ESCROW PENDING
                      </span>
                    )}
                    {order.status === 'DISPUTED' && (
                      <span className="font-mono" style={{ background: 'var(--accent-secondary)', color: '#141517', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 700 }}>
                        DISPUTED
                      </span>
                    )}
                  </div>
                  {order.status !== 'OPEN' ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/orders/${order.id}`;
                      }}
                      className="btn-primary" 
                      style={{ padding: '4px 10px', fontSize: '0.75rem', width: 'auto' }}
                    >
                      OPEN WORKSPACE →
                    </button>
                  ) : (
                    <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Buyer: {order.buyer.username}</span>
                  )}
                </div>
                <p className="font-mono" style={{ margin: '8px 0', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                  From: <strong>{order.startRank} {order.startDiv}</strong> ➜ To: <strong>{order.targetRank} {order.targetDiv}</strong>
                </p>
                
                {isExpanded && (
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border-light)' }} onClick={e => e.stopPropagation()}>
                    <div style={{ marginBottom: '15px' }}>
                      <h4 className="font-mono" style={{ marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>REQUESTED OPTIONS:</h4>
                      {options.length > 0 ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {options.map((opt: string) => (
                            <span key={opt} className="font-mono" style={{ padding: '4px 10px', background: 'var(--brand)', border: '1px solid var(--brand)', fontSize: '0.8rem', textTransform: 'uppercase', color: '#141517', fontWeight: 800, borderRadius: '2px', boxShadow: '0 0 5px rgba(0, 230, 118, 0.3)' }}>{opt}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>NONE</span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '15px' }}>
                      <div>
                        {/* Display Current Bids for all Boosters */}
                        <div style={{ marginBottom: '20px' }}>
                          <h4 className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>ACTIVE BIDS:</h4>
                          {order.bids && order.bids.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {order.bids.map((b: any) => {
                                const isMyBid = b.boosterId === (session?.user as any)?.id;
                                const isEditing = editingBidId === b.id;
                                const isConfirmingDelete = confirmDeleteBidId === b.id;

                                return (
                                  <div key={b.id} className="font-mono" style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', padding: '8px 12px', border: '1px solid var(--border-light)' }}>
                                    
                                    {isEditing ? (
                                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%' }}>
                                        <span style={{ color: 'var(--brand)' }}>$</span>
                                        <input 
                                          type="number" 
                                          min="0.01"
                                          step="0.01"
                                          value={editAmount} 
                                          onChange={e => setEditAmount(e.target.value)} 
                                          className="input-field" 
                                          style={{ width: '80px', padding: '4px 8px', height: '28px', margin: 0 }} 
                                        />
                                        <button 
                                          onClick={() => updateBid(b.id, parseFloat(editAmount))} 
                                          className="btn-primary" 
                                          style={{ padding: '4px 10px', fontSize: '0.7rem', width: 'auto' }}
                                        >
                                          SAVE
                                        </button>
                                        <button 
                                          onClick={() => setEditingBidId(null)} 
                                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem' }}
                                        >
                                          CANCEL
                                        </button>
                                      </div>
                                    ) : isConfirmingDelete ? (
                                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--accent-secondary)' }}>DELETE THIS BID?</span>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                          <button 
                                            onClick={() => deleteBid(b.id)} 
                                            style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                                          >
                                            YES
                                          </button>
                                          <button 
                                            onClick={() => setConfirmDeleteBidId(null)} 
                                            style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.75rem' }}
                                          >
                                            NO
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <span>
                                          ${b.amount.toFixed(2)} by <strong>{b.booster?.username || 'Unknown'}</strong> {isMyBid && <span style={{ color: 'var(--brand)' }}>(You)</span>}
                                        </span>
                                        {isMyBid && order.status === 'OPEN' && (
                                          <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => {
                                              setEditingBidId(b.id);
                                              setEditAmount(b.amount.toString());
                                            }} style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>EDIT</button>
                                            <button onClick={() => setConfirmDeleteBidId(b.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>DELETE</button>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No bids placed yet.</p>
                          )}
                        </div>

                        {order.status === 'OPEN' ? (
                          <>
                            <h4 className="font-mono" style={{ marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>PLACE A BID:</h4>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="number" 
                                min="0" 
                                step="0.01"
                                id={`bid-${order.id}`} 
                                className="input-field" 
                                placeholder="Enter bid amount ($)" 
                                style={{ width: '100%', margin: 0 }} 
                              />
                              <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => {
                                const val = (document.getElementById(`bid-${order.id}`) as HTMLInputElement).value;
                                if (val) placeBid(order.id, parseFloat(val));
                              }}>SUBMIT BID</button>
                            </div>
                          </>
                        ) : order.status === 'IN_PROGRESS' ? (
                          <>
                            <h4 className="font-mono" style={{ marginBottom: '8px', color: 'var(--brand)', fontSize: '0.85rem' }}>BOOST IN PROGRESS</h4>
                            <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '12px' }}>You are actively working on this order. Chat with the buyer for updates.</p>
                            <button className="btn-primary" style={{ width: '100%' }} onClick={() => completeJob(order.id)}>MARK COMPLETE & WAIT FOR ESCROW</button>
                          </>
                        ) : order.status === 'PENDING_COMPLETION' ? (
                          <>
                            <h4 className="font-mono" style={{ marginBottom: '8px', color: 'var(--accent)', fontSize: '0.85rem' }}>PENDING COMPLETION</h4>
                            <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '12px' }}>You marked this order as complete. Waiting for buyer to confirm delivery. Funds will auto-release in 3 days if buyer does not respond.</p>
                          </>
                        ) : order.status === 'DISPUTED' ? (
                          <>
                            <h4 className="font-mono" style={{ marginBottom: '8px', color: 'var(--accent-secondary)', fontSize: '0.85rem' }}>ORDER DISPUTED</h4>
                            <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '12px' }}>The buyer has opened a dispute. Escrow is frozen. An admin will review the chat logs shortly.</p>
                          </>
                        ) : null}
                      </div>
                      <div>
                        {session?.user && <OrderChat orderId={order.id} boosterId={(session.user as any).id} currentUsername={(session.user as any).name} />}
                      </div>
                    </div>
                  </div>
                )}
                {!isExpanded && <p className="font-mono" style={{ color: 'var(--brand)', fontSize: '0.75rem', marginTop: '8px' }}>[CLICK TO VIEW DETAILS & CHAT]</p>}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
