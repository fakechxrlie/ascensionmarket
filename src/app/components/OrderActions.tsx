"use client";
import React, { useState } from 'react';

export default function OrderActions({ orderId, status }: { orderId: string, status: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDispute = async () => {
    if (!confirm('Are you sure you want to dispute this order? Funds will be frozen and Admin will be alerted.')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/dispute`, { method: 'POST' });
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
    if (!confirm('Release funds to booster and complete job?')) {
      return;
    }
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {error && (
        <span className="font-mono" style={{ color: 'var(--accent-secondary)', fontSize: '0.75rem' }}>
          [ERROR: {error.toUpperCase()}]
        </span>
      )}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={handleDispute} 
          disabled={loading}
          className="btn-primary" 
          style={{ width: 'auto', padding: '6px 12px', fontSize: '0.7rem', background: 'transparent', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)' }}
        >
          {loading ? 'PROCESSING...' : 'DISPUTE ORDER'}
        </button>

        {status === 'PENDING_COMPLETION' && (
          <button 
            onClick={handleConfirm} 
            disabled={loading}
            className="btn-primary" 
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.7rem' }}
          >
            {loading ? 'PROCESSING...' : 'CONFIRM DELIVERY'}
          </button>
        )}
      </div>
    </div>
  );
}
