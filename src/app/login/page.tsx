"use client";
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setIsRegistering(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username })
      });
      if (res.ok) {
        await signIn('credentials', { email, password, callbackUrl: '/market' });
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
      }
    } else {
      const res = await signIn('credentials', {
        email, password, redirect: false
      });
      if (res?.error) {
        setError('Invalid credentials');
      } else {
        router.push('/market');
        router.refresh();
      }
    }
  };

  return (
    <main className="container" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="panel" style={{ maxWidth: '400px', width: '100%', marginTop: '50px', border: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', marginBottom: '20px' }}>
          <h2 className="font-mono" style={{ fontSize: '1.1rem', color: 'var(--brand)', margin: 0 }}>
            {isRegistering ? '// REGISTER ACCOUNT' : '// IDENTITY AUTHENTICATION'}
          </h2>
        </div>

        {error && <p className="font-mono" style={{ color: 'var(--accent-secondary)', marginBottom: '15px', fontSize: '0.8rem', fontWeight: 600 }}>[ERROR: {error.toUpperCase()}]</p>}
        
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label className="font-mono" style={{ fontSize: '0.75rem' }}>USERNAME</label>
              <input type="text" required className="input-field" placeholder="e.g. ProBooster99" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label className="font-mono" style={{ fontSize: '0.75rem' }}>EMAIL ADDRESS</label>
            <input type="email" required className="input-field" placeholder="Enter registration email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="font-mono" style={{ fontSize: '0.75rem' }}>PASSWORD</label>
            <input type="password" required className="input-field" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            {isRegistering ? 'CREATE ACCOUNT' : 'AUTHENTICATE ACCESS'}
          </button>
        </form>

        <p className="font-mono" style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {isRegistering ? 'ALREADY HAVE AN ACCOUNT? ' : 'NO ACCOUNT? '}
          <button type="button" onClick={() => setIsRegistering(!isRegistering)} style={{ color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
            {isRegistering ? 'SIGN IN' : 'REGISTER NOW'}
          </button>
        </p>
      </div>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
