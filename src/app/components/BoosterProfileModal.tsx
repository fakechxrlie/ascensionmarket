import React from 'react';

export default function BoosterProfileModal({ booster, onClose }: { booster: any, onClose: () => void }) {
  if (!booster) return null;

  const getXpBar = (xp: number) => {
    const max = 5000;
    const filled = Math.min(Math.floor((xp / max) * 15), 15);
    const empty = 15 - filled;
    return `XP: ${xp.toLocaleString()} / ${max.toLocaleString()} [${'|'.repeat(filled)}${'.'.repeat(empty)}]`;
  };

  const isHighLevel = booster.level >= 10;
  const borderStyle = isHighLevel ? '3px double var(--brand)' : '1px solid var(--border-light)';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(5px)'
    }}>
      <div className="panel" style={{
        background: 'var(--bg-main)', border: '1px solid var(--border-light)',
        width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', right: '15px', background: 'transparent',
          border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', zIndex: 10
        }}>✕</button>

        {/* Header */}
        <div style={{ padding: '30px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '20px', alignItems: 'center', background: 'var(--bg-card)' }}>
          {booster.avatarUrl ? (
            <img 
              src={booster.avatarUrl} 
              alt={booster.username} 
              style={{ width: '80px', height: '80px', objectFit: 'cover', border: borderStyle }} 
            />
          ) : (
            <div className="font-mono" style={{
              width: '80px', height: '80px', background: 'var(--bg-input)', border: borderStyle,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', fontSize: '1.5rem', fontWeight: 'bold'
            }}>
              {booster.username.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div style={{ flex: 1 }}>
            <h2 className="font-mono" style={{ margin: '0 0 5px 0', fontSize: '1.4rem', color: 'var(--text-main)' }}>
              {booster.username}
            </h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
              <span className="font-mono" style={{ color: 'var(--brand)', fontWeight: 700, fontSize: '0.9rem' }}>LVL {booster.level || 1}</span>
              <span className="font-mono" style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>{booster.rating} ★ ({booster.reviewCount} reviews)</span>
            </div>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {getXpBar(booster.xp || 0)}
            </div>
          </div>
        </div>

        {/* Slogan */}
        {booster.slogan && (
          <div style={{ padding: '20px 30px', borderBottom: '1px solid var(--border-light)', background: 'rgba(0, 230, 118, 0.05)' }}>
            <p className="font-mono" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--accent)', fontStyle: 'italic' }}>
              "{booster.slogan}"
            </p>
          </div>
        )}

        {/* Reviews List */}
        <div style={{ padding: '30px' }}>
          <h3 className="font-mono" style={{ margin: '0 0 20px 0', fontSize: '1rem', color: 'var(--text-muted)' }}>// RECENT REVIEWS</h3>
          
          {!booster.reviews || booster.reviews.length === 0 ? (
            <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No reviews yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {booster.reviews.map((r: any, i: number) => {
                // Censor buyer name
                const rawName = r.buyer?.username || 'Unknown';
                const censoredName = rawName.length > 2 
                  ? rawName.substring(0, 2) + '*'.repeat(Math.max(3, rawName.length - 2)) 
                  : rawName + '***';

                return (
                  <div key={i} style={{ padding: '15px', background: 'var(--bg-input)', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{censoredName}</strong>
                      <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>{r.rating} ★</span>
                    </div>
                    <p className="font-mono" style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      "{r.comment}"
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
