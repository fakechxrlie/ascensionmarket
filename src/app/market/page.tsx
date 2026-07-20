import React from 'react';

export default function MarketSelect() {
  const games = [
    { id: 'apex', name: 'Apex Legends', image: '/assets/apex_bg.png', color: '#ef4444' },
    { id: 'valorant', name: 'Valorant', image: '/assets/valorant_bg.png', color: '#f43f5e' },
    { id: 'r6', name: 'Rainbow 6 Siege', image: '/assets/r6_bg.png', color: '#eab308' },
    { id: 'rl', name: 'Rocket League', image: '/assets/rl_bg.png', color: '#3b82f6' },
    { id: 'fortnite', name: 'Fortnite', image: '/assets/fn_bg.png', color: '#8b5cf6' },
    { id: 'cs2', name: 'Counter-Strike 2', image: '/assets/cs2_bg.png', color: '#f59e0b' }
  ];

  return (
    <main className="container">
      <div style={{ marginTop: '40px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        <h1 className="font-mono" style={{ fontSize: '1.6rem', color: 'var(--brand)', margin: 0 }}>
          // SELECT GAME
        </h1>
        <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
          SELECT A GAME TO START CONFIGURING YOUR BOOST
        </p>
      </div>
      
      <div className="grid-select" style={{ marginTop: '20px' }}>
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
    </main>
  );
}
