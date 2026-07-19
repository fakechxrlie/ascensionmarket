"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Verify() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // KYC requirements
  const [doc1, setDoc1] = useState('');
  const [doc2, setDoc2] = useState('');
  
  const [game, setGame] = useState('Valorant');
  const [gameUsername, setGameUsername] = useState('');
  const [skillProof, setSkillProof] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kycData: JSON.stringify({ doc1, doc2 }),
          games: [game],
          gameUsernames: { [game]: gameUsername },
          skillProof
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Verification submitted! The site owner will review your application soon.");
        router.push('/dashboard');
      } else {
        alert("Failed to submit: " + data.error);
      }
    } catch (err) {
      alert("Error submitting verification.");
    }
    setLoading(false);
  }

  return (
    <main className="container" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="panel" style={{ maxWidth: '650px', width: '100%', marginTop: '30px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', padding: '24px' }}>
        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '20px' }}>
          <h2 className="font-mono" style={{ fontSize: '1.25rem', color: 'var(--brand)', margin: 0 }}>
            // BOOSTER APPLICATION
          </h2>
          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            STATUS: PENDING VERIFICATION
          </span>
        </div>

        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.85rem', lineHeight: '1.4' }}>
          Verification is required to become a seller on Ascension. All documents are securely processed using end-to-end encryption.
        </p>
        
        <form onSubmit={handleVerify}>
          <div style={{ background: 'var(--bg-input)', padding: '16px', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
            <h4 className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--brand)', marginBottom: '12px' }}>
              REQUIRED IDENTITY DOCUMENTS
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
              <div>
                <label className="font-mono" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  REQUIREMENT 1: A clear, unedited photo of you holding up your physical ID directly next to your face.
                </label>
                <input 
                  type="text" 
                  value={doc1} 
                  onChange={e => setDoc1(e.target.value)} 
                  required 
                  className="input-field" 
                  placeholder="Enter link to uploaded photo" 
                />
              </div>

              <div>
                <label className="font-mono" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  REQUIREMENT 2: A separate, high-resolution photo of only the front of your ID, captured in clear lighting.
                </label>
                <input 
                  type="text" 
                  value={doc2} 
                  onChange={e => setDoc2(e.target.value)} 
                  required 
                  className="input-field" 
                  placeholder="Enter link to document scan" 
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>PRIMARY GAME</label>
            <select value={game} onChange={e => setGame(e.target.value)} className="input-field" style={{ height: '40px' }}>
              <option value="Valorant">Valorant</option>
              <option value="Apex Legends">Apex Legends</option>
              <option value="Rainbow 6 Siege">Rainbow 6 Siege</option>
              <option value="Rocket League">Rocket League</option>
            </select>
          </div>

          <div className="form-group">
            <label className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>GAME USERNAME</label>
            <input 
              type="text" 
              value={gameUsername} 
              onChange={e => setGameUsername(e.target.value)} 
              required 
              className="input-field" 
              placeholder="e.g. PlayerOne#NA1" 
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>SKILL PROOF (RANK SCREENSHOT LINK)</label>
            <input 
              type="text" 
              value={skillProof} 
              onChange={e => setSkillProof(e.target.value)} 
              required 
              className="input-field" 
              placeholder="Enter link to rank screenshot" 
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
            {loading ? 'SUBMITTING APPLICATION...' : 'SUBMIT APPLICATION'}
          </button>
        </form>
      </div>
    </main>
  );
}
