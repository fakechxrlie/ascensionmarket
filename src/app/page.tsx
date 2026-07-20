import React from 'react';

export default function Home() {
  const games = [
    { id: 'apex', name: 'Apex Legends', image: '/assets/apex_bg.png' },
    { id: 'valorant', name: 'Valorant', image: '/assets/valorant_bg.png' },
    { id: 'r6', name: 'Rainbow 6 Siege', image: '/assets/r6_bg.png' },
    { id: 'rl', name: 'Rocket League', image: '/assets/rl_bg.png' },
    { id: 'fortnite', name: 'Fortnite', image: '/assets/fn_bg.png' },
    { id: 'cs2', name: 'Counter-Strike 2', image: '/assets/cs2_bg.png' }
  ];

  return (
    <main className="container" style={{ marginTop: '50px', marginBottom: '80px' }}>
      
      {/* Simple, Clean Hero Section */}
      <div style={{ 
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        padding: '50px 40px',
        marginBottom: '50px',
        textAlign: 'center'
      }}>
        <h1 className="font-mono" style={{ fontSize: '3rem', margin: '0 0 15px 0', color: 'var(--text-main)', letterSpacing: '-1px' }}>
          ASCENSION
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '30px', maxWidth: '650px', marginLeft: 'auto', marginRight: 'auto' }}>
          A secure rank-boosting marketplace. Configure your order and purchase boosts directly from verified boosters. Live chat with your booster, view open bidding lists, and leave reviews upon order completion.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <a href="/market" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ width: 'auto', padding: '12px 30px', fontSize: '0.85rem' }}>
              EXPLORE MARKETPLACE
            </button>
          </a>
        </div>
      </div>

      {/* Select Game Grid */}
      <div>
        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '25px' }}>
          <h2 className="font-mono" style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0 }}>
            // SELECT A GAME
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
