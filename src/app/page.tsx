import React from 'react';

export default function Home() {
  const games = [
    { id: 'apex', name: 'Apex Legends', image: '/assets/apex_bg.png' },
    { id: 'valorant', name: 'Valorant', image: '/assets/valorant_bg.png' },
    { id: 'r6', name: 'Rainbow 6 Siege', image: '/assets/r6_bg.png' },
    { id: 'rl', name: 'Rocket League', image: '/assets/rl_bg.png' }
  ];

  return (
    <main className="container" style={{ marginTop: '40px', marginBottom: '80px' }}>
      
      {/* Hero Grid Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1.2fr 1fr', 
        gap: '40px', 
        alignItems: 'center', 
        marginBottom: '60px',
        background: 'linear-gradient(135deg, rgba(28,29,33,0.8) 0%, rgba(20,21,23,0.8) 100%)',
        border: '1px solid var(--border-light)',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.03) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 0
        }}></div>

        <div style={{ zIndex: 1 }}>
          <span className="font-mono" style={{ color: 'var(--brand)', letterSpacing: '2px', fontSize: '0.8rem', fontWeight: 600 }}>
            // PROTOCOL: ELEVATION // PEER-TO-PEER MARKETPLACE
          </span>
          <h1 className="font-mono" style={{ fontSize: '3rem', margin: '15px 0', lineHeight: 1.1, color: 'var(--text-main)', letterSpacing: '-1px' }}>
            ASCENSION
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '30px', maxWidth: '550px' }}>
            Secure your rank with the industry's premium peer-to-peer rank-boosting marketplace. Protected by active escrow contracts, direct booster chat, open bidding lists, and booster review ratings.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <a href="/market" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ width: 'auto', padding: '12px 28px', fontSize: '0.85rem' }}>
                EXPLORE MARKETPLACE
              </button>
            </a>
            <a href="/verify" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ width: 'auto', padding: '12px 28px', fontSize: '0.85rem', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-light)' }}>
                BECOME A BOOSTER
              </button>
            </a>
          </div>
        </div>

        {/* Tactical Monitor Feed */}
        <div className="panel" style={{ zIndex: 1, padding: '20px', background: '#141517', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', marginBottom: '15px' }}>
            <span className="font-mono" style={{ color: 'var(--brand)', fontSize: '0.75rem', fontWeight: 600 }}>[SYS_LOG] PROTOCOL STATUS</span>
            <span className="font-mono" style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>● PIPELINE ACTIVE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Log Entry 1 */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span className="font-mono" style={{ color: 'var(--brand)' }}>[VAL-9810] VALORANT</span>
                <span className="font-mono" style={{ color: 'var(--accent)' }}>IN PROGRESS</span>
              </div>
              <p className="font-mono" style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                PLATINUM ➜ DIAMOND | Bid: $75.00
              </p>
            </div>
            {/* Log Entry 2 */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span className="font-mono" style={{ color: 'var(--brand)' }}>[APX-4402] APEX LEGENDS</span>
                <span className="font-mono" style={{ color: 'var(--accent)' }}>BIDDING OPEN</span>
              </div>
              <p className="font-mono" style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                GOLD II ➜ MASTER | Bids: 5 | Low: $110.00
              </p>
            </div>
            {/* Log Entry 3 */}
            <div style={{ paddingBottom: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span className="font-mono" style={{ color: 'var(--brand)' }}>[R6S-1120] R6 SIEGE</span>
                <span className="font-mono" style={{ color: 'var(--text-muted)' }}>COMPLETED</span>
              </div>
              <p className="font-mono" style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                SILVER I ➜ PLATINUM III | Payout: $95.00
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', marginTop: '15px', border: '1px solid var(--border-light)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ESCROW SECURED</div>
              <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--brand)', fontWeight: 'bold' }}>100% SECURE</div>
            </div>
            <div>
              <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ACTIVE AGENTS</div>
              <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 'bold' }}>254 VERIFIED</div>
            </div>
          </div>
        </div>
      </div>

      {/* Choose Game Section */}
      <div>
        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '25px' }}>
          <h2 className="font-mono" style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0 }}>
            // SELECT SERVICE SECTOR
          </h2>
        </div>

        <div className="grid-select">
          {games.map(g => (
            <a href={`/market/${g.id}`} key={g.id} className="game-card-cover">
              <div className="card-image-wrapper">
                 <img src={g.image} alt={g.name} className="card-bg-image" />
                 <div className="card-overlay"></div>
              </div>
              <div className="card-content">
                <h3>{g.name.toUpperCase()}</h3>
              </div>
            </a>
          ))}
        </div>
      </div>

    </main>
  );
}
