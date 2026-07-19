"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Verify() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // KYC requirements (stored as Base64 data URLs)
  const [doc1, setDoc1] = useState('');
  const [doc2, setDoc2] = useState('');
  
  const allAvailableGames = ['Valorant', 'Apex Legends', 'Rainbow 6 Siege', 'Rocket League'];
  
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [gameUsernames, setGameUsernames] = useState<Record<string, string>>({});
  const [skillProofs, setSkillProofs] = useState<Record<string, string>>({});

  const handleFileChange = (file: File, setter: (val: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleGameSelection = (gameName: string) => {
    if (selectedGames.includes(gameName)) {
      setSelectedGames(selectedGames.filter(g => g !== gameName));
      // Cleanup usernames & proofs
      const newNames = { ...gameUsernames };
      delete newNames[gameName];
      setGameUsernames(newNames);

      const newProofs = { ...skillProofs };
      delete newProofs[gameName];
      setSkillProofs(newProofs);
    } else {
      setSelectedGames([...selectedGames, gameName]);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(false);
    setErrorMsg('');
    setSuccessMsg('');

    if (selectedGames.length === 0) {
      setErrorMsg('Please select at least one game to apply.');
      return;
    }

    // Verify all selected games have values filled
    for (const g of selectedGames) {
      if (!gameUsernames[g]) {
        setErrorMsg(`Please enter your account name for ${g}.`);
        return;
      }
      if (!skillProofs[g]) {
        setErrorMsg(`Please upload a rank screenshot for ${g}.`);
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kycData: JSON.stringify({ doc1, doc2 }),
          games: selectedGames,
          gameUsernames: gameUsernames,
          skillProof: JSON.stringify(skillProofs)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Application submitted successfully! The owner will review it soon.");
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setErrorMsg(data.error || "Failed to submit application.");
      }
    } catch (err) {
      setErrorMsg("Error submitting verification.");
    }
    setLoading(false);
  };

  return (
    <main className="container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '80px' }}>
      <div className="panel" style={{ maxWidth: '650px', width: '100%', marginTop: '30px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', padding: '24px' }}>
        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '20px' }}>
          <h2 className="font-mono" style={{ fontSize: '1.25rem', color: 'var(--brand)', margin: 0 }}>
            // BOOSTER APPLICATION
          </h2>
          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            STATUS: PENDING VERIFICATION
          </span>
        </div>

        {errorMsg && (
          <div className="font-mono" style={{ padding: '10px 15px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)', fontSize: '0.8rem', marginBottom: '15px' }}>
            [ERROR: {errorMsg.toUpperCase()}]
          </div>
        )}

        {successMsg && (
          <div className="font-mono" style={{ padding: '10px 15px', background: 'rgba(0, 230, 118, 0.08)', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '0.8rem', marginBottom: '15px' }}>
            [SYSTEM: {successMsg.toUpperCase()}]
          </div>
        )}

        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.85rem', lineHeight: '1.4' }}>
          Verification is required to become a booster on Ascension. Please upload the required documents and select the games you would like to boost. <strong>All files are secure and use end-to-end encryption.</strong>
        </p>
        
        <form onSubmit={handleVerify}>
          {/* KYC ID Upload Section */}
          <div style={{ background: 'var(--bg-input)', padding: '16px', border: '1px solid var(--border-light)', marginBottom: '25px' }}>
            <h4 className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--brand)', marginBottom: '12px' }}>
              REQUIRED IDENTITY DOCUMENTS
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              {/* Doc 1 */}
              <div>
                <label className="font-mono" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  1. A clear photo of you holding your physical ID next to your face:
                </label>
                <div style={{ border: '1px dashed var(--border-light)', padding: '16px', background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'center', position: 'relative' }}>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {doc1 ? '✓ FILE LOADED (CLICK TO CHANGE)' : 'Select or drop image file'}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    required={!doc1}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange(file, setDoc1);
                    }}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                </div>
                {doc1 && (
                  <img src={doc1} alt="ID scan 1" style={{ marginTop: '10px', maxHeight: '100px', display: 'block', border: '1px solid var(--border-light)' }} />
                )}
              </div>

              {/* Doc 2 */}
              <div>
                <label className="font-mono" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  2. A high-resolution photo of the front of your ID in front of your dashboard showing your username:
                </label>
                <div style={{ border: '1px dashed var(--border-light)', padding: '16px', background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'center', position: 'relative' }}>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {doc2 ? '✓ FILE LOADED (CLICK TO CHANGE)' : 'Select or drop image file'}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    required={!doc2}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange(file, setDoc2);
                    }}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                </div>
                {doc2 && (
                  <img src={doc2} alt="ID scan 2" style={{ marginTop: '10px', maxHeight: '100px', display: 'block', border: '1px solid var(--border-light)' }} />
                )}
              </div>
            </div>
          </div>

          {/* Game Selection checkboxes */}
          <div style={{ background: 'var(--bg-input)', padding: '16px', border: '1px solid var(--border-light)', marginBottom: '25px' }}>
            <h4 className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--brand)', marginBottom: '12px' }}>
              SELECT GAMES TO BOOST
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              {allAvailableGames.map(gName => {
                const isChecked = selectedGames.includes(gName);
                return (
                  <label key={gName} className="font-mono" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isChecked} 
                      onChange={() => toggleGameSelection(gName)} 
                      style={{ cursor: 'pointer' }}
                    />
                    {gName.toUpperCase()}
                  </label>
                );
              })}
            </div>

            {/* Render fields for each selected game */}
            {selectedGames.map(gName => (
              <div key={gName} style={{ borderTop: '1px solid var(--border-light)', marginTop: '15px', paddingTop: '15px' }}>
                <h5 className="font-mono" style={{ color: 'var(--brand)', fontSize: '0.8rem', margin: '0 0 10px 0' }}>
                  // CONFIG: {gName.toUpperCase()}
                </h5>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label className="font-mono" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      ACCOUNT NAME & ID:
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={gameUsernames[gName] || ''} 
                      onChange={e => setGameUsernames({ ...gameUsernames, [gName]: e.target.value })} 
                      placeholder="e.g. Player#NA1"
                      className="input-field" 
                      style={{ margin: 0, height: '36px' }}
                    />
                  </div>
                  
                  <div>
                    <label className="font-mono" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      RANK PROOF SCREENSHOT:
                    </label>
                    <div style={{ border: '1px dashed var(--border-light)', padding: '8px', background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'center', position: 'relative', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {skillProofs[gName] ? '✓ UPLOADED' : 'CHOOSE IMAGE'}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        required={!skillProofs[gName]}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleFileChange(file, (val) => setSkillProofs(prev => ({ ...prev, [gName]: val })));
                        }}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>

                {skillProofs[gName] && (
                  <img src={skillProofs[gName]} alt={`${gName} Proof`} style={{ marginTop: '10px', maxHeight: '80px', border: '1px solid var(--border-light)' }} />
                )}
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
            {loading ? 'SUBMITTING APPLICATION...' : 'SUBMIT APPLICATION'}
          </button>
        </form>
      </div>
    </main>
  );
}
