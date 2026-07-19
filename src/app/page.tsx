import React from 'react';

export default function Home() {
  return (
    <main className="container hero">
      <h1 style={{ fontSize: '4.5rem', marginBottom: '20px', letterSpacing: '-1px' }}>Level up without the risk.</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
        The premium marketplace for verified gaming services. Every transaction is protected by our custom escrow and manual ID verification.
      </p>
      <a href="/market"><button className="btn-primary" style={{ width: 'auto', padding: '16px 40px', fontSize: '1.1rem' }}>Explore Marketplace</button></a>
    </main>
  );
}
