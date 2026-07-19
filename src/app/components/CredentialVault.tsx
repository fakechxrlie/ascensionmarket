"use client";
import React, { useState, useEffect } from 'react';

interface VaultProps {
  orderId: string;
  isBuyer: boolean;
  initialCredentials?: string | null;
}

export default function CredentialVault({ orderId, isBuyer, initialCredentials }: VaultProps) {
  const [platform, setPlatform] = useState('PC');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState('');
  
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    if (initialCredentials) {
      try {
        const parsed = JSON.parse(initialCredentials);
        setPlatform(parsed.platform || 'PC');
        setUsername(parsed.username || '');
        setPassword(parsed.password || '');
        setTwoFactor(parsed.twoFactor || '');
      } catch (e) {
        console.error('Failed to parse credentials', e);
      }
    }
  }, [initialCredentials]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const credsJson = JSON.stringify({ platform, username, password, twoFactor });

    try {
      const res = await fetch(`/api/orders/${orderId}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials: credsJson })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: 'Credentials saved successfully to vault!', isError: false });
      } else {
        setMessage({ text: 'Error saving: ' + (data.error || 'Failed'), isError: true });
      }
    } catch (err) {
      setMessage({ text: 'Network error saving credentials', isError: true });
    } finally {
      setLoading(false);
    }
  };

  if (!isBuyer) {
    // Booster/Owner view
    if (!initialCredentials) {
      return (
        <div style={{ background: 'var(--bg-input)', border: '1px dashed var(--border-light)', padding: '15px', color: 'var(--text-muted)' }} className="font-mono">
          [SECURE VAULT: WAITING FOR BUYER TO SUBMIT DETAILS]
        </div>
      );
    }

    return (
      <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', padding: '15px' }} className="font-mono">
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--accent-secondary)' }}>🔒 SECURE CREDENTIALS VAULT</h4>
        {revealed ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
            <div>PLATFORM: <strong style={{ color: 'var(--text-main)' }}>{platform}</strong></div>
            <div>USERNAME: <strong style={{ color: 'var(--text-main)' }}>{username}</strong></div>
            <div>PASSWORD: <strong style={{ color: 'var(--text-main)' }}>{password}</strong></div>
            {twoFactor && <div>2FA BACKUPS: <strong style={{ color: 'var(--text-main)' }}>{twoFactor}</strong></div>}
            <button 
              onClick={() => setRevealed(false)} 
              className="btn-primary" 
              style={{ width: 'auto', padding: '4px 10px', fontSize: '0.75rem', marginTop: '10px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}
            >
              HIDE DETAILS
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>Login credentials provided by the buyer are encrypted and protected.</p>
            <button 
              onClick={() => setRevealed(true)} 
              className="btn-primary" 
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.75rem', background: 'var(--accent-secondary)', borderColor: 'var(--accent-secondary)' }}
            >
              REVEAL CREDENTIALS
            </button>
          </div>
        )}
      </div>
    );
  }

  // Buyer form view
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '18px' }} className="font-mono">
      <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--brand)' }}>🔒 SECURE CREDENTIALS VAULT</h4>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
        Provide your game account login below. This information is shared *only* with your assigned booster and admin.
      </p>

      {message && (
        <div style={{
          padding: '8px 12px',
          background: message.isError ? 'rgba(239, 68, 68, 0.08)' : 'rgba(0, 230, 118, 0.08)',
          border: `1px solid ${message.isError ? 'var(--accent-secondary)' : 'var(--accent)'}`,
          color: message.isError ? 'var(--accent-secondary)' : 'var(--accent)',
          fontSize: '0.75rem',
          marginBottom: '15px'
        }}>
          [{message.text.toUpperCase()}]
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PLATFORM</label>
            <select 
              value={platform} 
              onChange={e => setPlatform(e.target.value)} 
              className="input-field" 
              style={{ height: '32px', margin: '4px 0 0 0', padding: '0 8px', fontSize: '0.8rem' }}
            >
              <option value="PC">PC</option>
              <option value="PLAYSTATION">PlayStation</option>
              <option value="XBOX">Xbox</option>
              <option value="NINTENDO">Nintendo Switch</option>
              <option value="MOBILE">Mobile</option>
            </select>
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>USERNAME / EMAIL</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required
              placeholder="e.g. yourname@email.com" 
              className="input-field" 
              style={{ height: '32px', margin: '4px 0 0 0', padding: '6px 10px', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PASSWORD</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required
            placeholder="Account Password" 
            className="input-field" 
            style={{ height: '32px', margin: '4px 0 0 0', padding: '6px 10px', fontSize: '0.8rem' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>2FA BACKUP CODES / EXTRA DETAILS (RECOMMENDED)</label>
          <input 
            type="text" 
            value={twoFactor} 
            onChange={e => setTwoFactor(e.target.value)} 
            placeholder="Backup codes (steam/epic/etc.) or character name" 
            className="input-field" 
            style={{ height: '32px', margin: '4px 0 0 0', padding: '6px 10px', fontSize: '0.8rem' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary" 
          style={{ width: 'auto', alignSelf: 'flex-start', padding: '6px 20px', fontSize: '0.75rem', marginTop: '10px' }}
        >
          {loading ? 'SAVING...' : 'SAVE VAULT CREDENTIALS'}
        </button>
      </form>
    </div>
  );
}
