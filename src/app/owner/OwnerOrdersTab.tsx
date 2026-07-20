"use client";
import React, { useState } from 'react';

export default function OwnerOrdersTab({ 
  orders, 
  boosters = [],
  updateOrderStatus, 
  resolveDispute,
  assignBooster
}: { 
  orders: any[], 
  boosters: any[],
  updateOrderStatus: (formData: FormData) => void,
  resolveDispute: (formData: FormData) => void,
  assignBooster: (formData: FormData) => void
}) {
  const [search, setSearch] = useState('');
  
  const filtered = orders.filter(o => 
    o.id.includes(search) || 
    o.game.toLowerCase().includes(search.toLowerCase()) || 
    o.buyer.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <input 
        type="text" 
        placeholder="Search orders by ID, Game, or Username..." 
        className="input-field" 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        style={{ marginBottom: '10px' }}
      />
      <div style={{ display: 'grid', gap: '15px' }}>
        {filtered.map(o => {
          const acceptedBid = o.bids?.find((b: any) => b.status === 'ACCEPTED');
          const boosterUsername = acceptedBid?.booster?.username || 'None';

          return (
            <div key={o.id} className="panel" style={{ background: 'var(--bg-card)', padding: '15px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <a href={`/orders/${o.id}`} className="font-mono" style={{ margin: 0, color: 'var(--brand)', fontSize: '1rem', textDecoration: 'none' }}>{o.game} - {o.startRank} to {o.targetRank} ↗</a>
                <div className="font-mono" style={{ color: 'var(--text-main)', fontSize: '0.8rem', marginTop: '4px' }}>
                  Order ID: {o.id}
                </div>
                <div className="font-mono" style={{ color: 'var(--text-main)', fontSize: '0.8rem', marginTop: '4px' }}>
                  Buyer: {o.buyer.username} | Booster: {boosterUsername} | Escrow: ${o.escrowAmount.toFixed(2)}
                </div>
                <div className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                  Created: {new Date(o.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Assign Booster Form */}
                <form action={assignBooster} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="hidden" name="orderId" value={o.id} />
                  <select name="boosterId" className="input-field" style={{ padding: '4px 8px', margin: 0, fontSize: '0.75rem', height: 'auto', width: '130px' }} defaultValue={acceptedBid?.booster?.id || ''}>
                    <option value="">-- Unassigned --</option>
                    {boosters.map(b => (
                      <option key={b.id} value={b.id}>{b.username}</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    name="bidAmount" 
                    placeholder="Payout" 
                    step="0.01"
                    defaultValue={o.escrowAmount || 0}
                    className="input-field" 
                    style={{ width: '70px', padding: '4px 8px', margin: 0, fontSize: '0.75rem', height: 'auto' }} 
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '4px 8px', width: 'auto', fontSize: '0.7rem' }}>ASSIGN</button>
                </form>

                {/* Update Status Form */}
                <form action={updateOrderStatus} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="hidden" name="orderId" value={o.id} />
                  <select name="status" defaultValue={o.status} className="input-field" style={{ padding: '4px 8px', margin: 0, fontSize: '0.75rem', height: 'auto' }}>
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="PENDING_COMPLETION">PENDING_COMPLETION</option>
                    <option value="DISPUTED">DISPUTED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                  <button type="submit" className="btn-primary" style={{ padding: '4px 8px', width: 'auto', fontSize: '0.7rem' }}>STATUS</button>
                </form>
                
                {o.status === 'DISPUTED' && (
                  <div style={{ display: 'flex', gap: '5px', borderLeft: '1px solid var(--border-light)', paddingLeft: '10px' }}>
                    <form action={resolveDispute}>
                      <input type="hidden" name="orderId" value={o.id} />
                      <input type="hidden" name="winner" value="BUYER" />
                      <button type="submit" className="btn-primary" style={{ background: 'var(--accent-secondary)', color: '#141517', padding: '4px 8px', fontSize: '0.7rem', width: 'auto' }}>REFUND</button>
                    </form>
                    <form action={resolveDispute}>
                      <input type="hidden" name="orderId" value={o.id} />
                      <input type="hidden" name="winner" value="BOOSTER" />
                      <button type="submit" className="btn-primary" style={{ background: 'var(--accent)', color: '#141517', padding: '4px 8px', fontSize: '0.7rem', width: 'auto' }}>PAY</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
