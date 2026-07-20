"use client";
import React, { useState } from 'react';

export default function OrderActions({ 
  orderId, 
  status, 
  isBuyer = false, 
  isBooster = false 
}: { 
  orderId: string, 
  status: string, 
  isBuyer?: boolean, 
  isBooster?: boolean 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  const handleDispute = async () => {
    if (!disputeReason.trim()) {
      setError('Please provide a reason for the dispute.');
      return;
    }
    setShowDisputeModal(false);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/dispute`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: disputeReason })
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to dispute order');
      }
    } catch (err) {
      setError('Failed to dispute order');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm`, { method: 'POST' });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to confirm delivery');
      }
    } catch (err) {
      setError('Failed to confirm delivery');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setShowCompleteModal(false);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/complete`, { method: 'POST' });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to mark complete');
      }
    } catch (err) {
      setError('Failed to mark complete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {error && (
        <span className="font-mono" style={{ color: 'var(--accent-secondary)', fontSize: '0.75rem' }}>
          [ERROR: {error.toUpperCase()}]
        </span>
      )}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setShowDisputeModal(true)} 
          disabled={loading}
          className="btn-primary" 
          style={{ width: 'auto', padding: '6px 12px', fontSize: '0.7rem', background: 'transparent', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)' }}
        >
          {loading ? 'PROCESSING...' : 'DISPUTE ORDER'}
        </button>

        {isBooster && status === 'IN_PROGRESS' && (
          <button 
            onClick={() => setShowCompleteModal(true)} 
            disabled={loading}
            className="btn-primary" 
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.7rem' }}
          >
            {loading ? 'PROCESSING...' : 'MARK COMPLETE'}
          </button>
        )}

        {isBuyer && status === 'PENDING_COMPLETION' && (
          <button 
            onClick={() => setShowConfirmModal(true)} 
            disabled={loading}
            className="btn-primary" 
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.7rem' }}
          >
            {loading ? 'PROCESSING...' : 'CONFIRM DELIVERY'}
          </button>
        )}
      </div>

      {showDisputeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-card)', padding: '20px', border: '1px solid var(--border-light)', width: '400px', maxWidth: '90%' }}>
            <h3 className="font-mono" style={{ color: 'var(--accent-secondary)', marginTop: 0 }}>// DISPUTE ORDER</h3>
            <p className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Are you sure you want to dispute this order? Funds will be frozen and Admin will be alerted.</p>
            <textarea 
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              placeholder="Please provide details about the dispute..."
              className="input-field"
              style={{ width: '100%', height: '80px', marginTop: '10px', resize: 'none', padding: '10px' }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button className="btn-primary" onClick={handleDispute} style={{ background: 'var(--accent-secondary)', color: '#fff', borderColor: 'var(--accent-secondary)' }}>SUBMIT DISPUTE</button>
              <button className="btn-primary" onClick={() => setShowDisputeModal(false)} style={{ background: 'transparent', color: 'var(--text-main)', borderColor: 'var(--border-light)' }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-card)', padding: '20px', border: '1px solid var(--border-light)', width: '400px', maxWidth: '90%' }}>
            <h3 className="font-mono" style={{ color: 'var(--brand)', marginTop: 0 }}>// MARK COMPLETE</h3>
            <p className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Are you sure you want to mark this order as complete? The buyer will be notified to confirm and release the funds.</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button className="btn-primary" onClick={handleComplete}>YES, MARK COMPLETE</button>
              <button className="btn-primary" onClick={() => setShowCompleteModal(false)} style={{ background: 'transparent', color: 'var(--text-main)', borderColor: 'var(--border-light)' }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-card)', padding: '20px', border: '1px solid var(--border-light)', width: '400px', maxWidth: '90%' }}>
            <h3 className="font-mono" style={{ color: 'var(--brand)', marginTop: 0 }}>// CONFIRM DELIVERY</h3>
            <p className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Are you sure you want to release funds to the booster and complete the job?</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button className="btn-primary" onClick={handleConfirm}>YES, RELEASE FUNDS</button>
              <button className="btn-primary" onClick={() => setShowConfirmModal(false)} style={{ background: 'transparent', color: 'var(--text-main)', borderColor: 'var(--border-light)' }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
