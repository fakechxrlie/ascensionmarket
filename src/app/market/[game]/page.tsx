"use client";

import React, { useState } from 'react';
import CustomSelect from '../../components/CustomSelect';

const GAME_DATA: Record<string, any> = {
  valorant: {
    name: 'Valorant',
    platforms: ['PC', 'PlayStation', 'Xbox'],
    pointsName: 'RR',
    ranks: [
      { name: 'Iron', divisions: ['1', '2', '3'] },
      { name: 'Bronze', divisions: ['1', '2', '3'] },
      { name: 'Silver', divisions: ['1', '2', '3'] },
      { name: 'Gold', divisions: ['1', '2', '3'] },
      { name: 'Platinum', divisions: ['1', '2', '3'] },
      { name: 'Diamond', divisions: ['1', '2', '3'] },
      { name: 'Ascendant', divisions: ['1', '2', '3'] },
      { name: 'Immortal', divisions: ['1', '2', '3'] },
      { name: 'Radiant', divisions: [] }
    ]
  },
  apex: {
    name: 'Apex Legends',
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    pointsName: 'RP',
    ranks: [
      { name: 'Bronze', divisions: ['IV', 'III', 'II', 'I'] },
      { name: 'Silver', divisions: ['IV', 'III', 'II', 'I'] },
      { name: 'Gold', divisions: ['IV', 'III', 'II', 'I'] },
      { name: 'Platinum', divisions: ['IV', 'III', 'II', 'I'] },
      { name: 'Diamond', divisions: ['IV', 'III', 'II', 'I'] },
      { name: 'Master', divisions: [] },
      { name: 'Apex Predator', divisions: [] }
    ]
  },
  r6: {
    name: 'Rainbow 6 Siege',
    platforms: ['PC', 'PlayStation', 'Xbox'],
    pointsName: 'RP',
    ranks: [
      { name: 'Copper', divisions: ['V', 'IV', 'III', 'II', 'I'] },
      { name: 'Bronze', divisions: ['V', 'IV', 'III', 'II', 'I'] },
      { name: 'Silver', divisions: ['V', 'IV', 'III', 'II', 'I'] },
      { name: 'Gold', divisions: ['V', 'IV', 'III', 'II', 'I'] },
      { name: 'Platinum', divisions: ['V', 'IV', 'III', 'II', 'I'] },
      { name: 'Emerald', divisions: ['V', 'IV', 'III', 'II', 'I'] },
      { name: 'Diamond', divisions: ['V', 'IV', 'III', 'II', 'I'] },
      { name: 'Champion', divisions: [] }
    ]
  },
  rl: {
    name: 'Rocket League',
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    pointsName: 'MMR',
    ranks: [
      { name: 'Bronze', divisions: ['I', 'II', 'III', 'IV'] },
      { name: 'Silver', divisions: ['I', 'II', 'III', 'IV'] },
      { name: 'Gold', divisions: ['I', 'II', 'III', 'IV'] },
      { name: 'Platinum', divisions: ['I', 'II', 'III', 'IV'] },
      { name: 'Diamond', divisions: ['I', 'II', 'III', 'IV'] },
      { name: 'Champion', divisions: ['I', 'II', 'III', 'IV'] },
      { name: 'Grand Champion', divisions: ['I', 'II', 'III', 'IV'] },
      { name: 'Supersonic Legend', divisions: [] }
    ]
  },
  fortnite: {
    name: 'Fortnite',
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'],
    pointsName: 'Points',
    ranks: [
      { name: 'Bronze', divisions: ['I', 'II', 'III'] },
      { name: 'Silver', divisions: ['I', 'II', 'III'] },
      { name: 'Gold', divisions: ['I', 'II', 'III'] },
      { name: 'Platinum', divisions: ['I', 'II', 'III'] },
      { name: 'Diamond', divisions: ['I', 'II', 'III'] },
      { name: 'Elite', divisions: ['I', 'II', 'III'] },
      { name: 'Champion', divisions: ['I', 'II', 'III'] },
      { name: 'Unreal', divisions: [] },
      { name: 'Unreal Legend', divisions: [] }
    ]
  },
  cs2: {
    name: 'Counter-Strike 2',
    platforms: ['PC'],
    pointsName: 'Elo',
    ranks: [
      { name: '0 - 4,999 (Grey)', divisions: [] },
      { name: '5,000 - 9,999 (Light Blue)', divisions: [] },
      { name: '10,000 - 14,999 (Blue)', divisions: [] },
      { name: '15,000 - 19,999 (Purple)', divisions: [] },
      { name: '20,000 - 24,999 (Fuchsia)', divisions: [] },
      { name: '25,000 - 29,999 (Red)', divisions: [] },
      { name: '30,000+ (Gold)', divisions: [] }
    ]
  },
  cs2_faceit: {
    name: 'Counter-Strike 2',
    platforms: ['PC'],
    pointsName: 'Elo',
    ranks: [
      { name: 'Level 1', divisions: [] },
      { name: 'Level 2', divisions: [] },
      { name: 'Level 3', divisions: [] },
      { name: 'Level 4', divisions: [] },
      { name: 'Level 5', divisions: [] },
      { name: 'Level 6', divisions: [] },
      { name: 'Level 7', divisions: [] },
      { name: 'Level 8', divisions: [] },
      { name: 'Level 9', divisions: [] },
      { name: 'Level 10', divisions: [] }
    ]
  }
};

export default function GameMarket({ params }: { params: Promise<{ game: string }> }) {
  const resolvedParams = React.use(params);
  const gameKey = resolvedParams.game;
  const game = GAME_DATA[gameKey] || GAME_DATA['valorant'];

  const [startRank, setStartRank] = useState(game.ranks[0].name);
  const [startDiv, setStartDiv] = useState(game.ranks[0].divisions[0] || '');
  const [startPts, setStartPts] = useState('');
  const [endRank, setEndRank] = useState(game.ranks[game.ranks.length - 1].name);
  const [endDiv, setEndDiv] = useState(game.ranks[game.ranks.length - 1].divisions?.[0] || '');
  const [endPts, setEndPts] = useState('');

  const [cs2Mode, setCs2Mode] = useState<'premier' | 'faceit'>('premier');
  const activeRanks = gameKey === 'cs2' && cs2Mode === 'faceit' ? GAME_DATA['cs2_faceit'].ranks : game.ranks;

  const [platform, setPlatform] = useState(game.platforms ? game.platforms[0] : 'PC');
  const [badgeOnly, setBadgeOnly] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState('');
  const [extraDetails, setExtraDetails] = useState('');
  const [popup, setPopup] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [options, setOptions] = useState({
    stream: false,
    priority: false,
    duo: false,
    offline: false
  });

  const handleStartRankChange = (val: string) => {
    setStartRank(val);
    const newRankData = activeRanks.find((r: any) => r.name === val);
    if (newRankData && newRankData.divisions.length > 0) {
      setStartDiv(newRankData.divisions[0]);
    } else {
      setStartDiv('');
    }
  };

  const handleEndRankChange = (val: string) => {
    setEndRank(val);
    const newRankData = activeRanks.find((r: any) => r.name === val);
    if (newRankData && newRankData.divisions.length > 0) {
      setEndDiv(newRankData.divisions[0]);
    } else {
      setEndDiv('');
    }
  };

  const handleCs2ModeChange = (mode: 'premier' | 'faceit') => {
    setCs2Mode(mode);
    const newRanks = mode === 'faceit' ? GAME_DATA['cs2_faceit'].ranks : game.ranks;
    setStartRank(newRanks[0].name);
    setEndRank(newRanks[newRanks.length - 1].name);
    setStartPts('');
    setEndPts('');
  };

  const startRankData = activeRanks.find((r: any) => r.name === startRank) || activeRanks[0];
  const endRankData = activeRanks.find((r: any) => r.name === endRank) || activeRanks[0];

  const handlePostOrder = async () => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: game.name,
          startRank: badgeOnly ? 'Badges' : startRank, 
          startDiv: badgeOnly ? '' : startDiv, 
          startPts: badgeOnly ? '' : startPts,
          targetRank: badgeOnly ? 'Boost' : endRank, 
          targetDiv: badgeOnly ? '' : endDiv, 
          targetPts: badgeOnly ? '' : endPts,
          options: [
            ...Object.keys(options).filter(k => options[k as keyof typeof options]),
            `Platform: ${platform}`,
            ...(gameKey === 'cs2' ? [`Mode: ${cs2Mode.toUpperCase()}`] : []),
            ...(badgeOnly ? ['BADGE BOOST', `Badges: ${selectedBadges}`] : []),
            ...(extraDetails.trim() ? [`Extra Details: ${extraDetails}`] : [])
          ]
        })
      });
      
      if (res.ok) {
        setPopup({ message: 'Order posted successfully! You can view it on your dashboard.', type: 'success' });
      } else {
        const data = await res.json();
        setPopup({ message: data.error || 'Failed to post order', type: 'error' });
      }
    } catch (err) {
      setPopup({ message: 'An error occurred.', type: 'error' });
    }
  };

  const handlePopupClose = () => {
    if (popup?.type === 'success') {
      window.location.href = '/dashboard';
    } else {
      setPopup(null);
    }
  };

  return (
    <main className="container">
      <div style={{ marginTop: '30px', marginBottom: '20px' }}>
        <a href="/market" className="font-mono" style={{ color: 'var(--brand)', textDecoration: 'none', fontSize: '0.8rem' }}>← BACK TO GAMES</a>
        <h1 className="font-mono" style={{ marginTop: '10px', fontSize: '1.6rem', color: 'var(--text-main)' }}>
          // CONFIGURE YOUR BOOST: {game.name.toUpperCase()}
        </h1>
        <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
          CONFIGURE YOUR CUSTOM ORDER SELECTIONS BELOW
        </p>
      </div>

      {popup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.85)', zIndex: 9999, 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="panel" style={{ 
            background: 'var(--bg-card)', 
            border: `1px solid ${popup.type === 'success' ? 'var(--brand)' : 'var(--accent-secondary)'}`, 
            padding: '30px', 
            maxWidth: '400px', 
            width: '90%', 
            textAlign: 'center' 
          }}>
            <h3 className="font-mono" style={{ 
              color: popup.type === 'success' ? 'var(--brand)' : 'var(--accent-secondary)', 
              fontSize: '1.2rem', 
              marginBottom: '15px' 
            }}>
              {popup.type === 'success' ? '// SUCCESS' : '// ERROR'}
            </h3>
            <p className="font-mono" style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '25px', lineHeight: '1.5' }}>
              {popup.message}
            </p>
            <button onClick={handlePopupClose} className="btn-primary" style={{ width: '100%', padding: '10px' }}>
              OK
            </button>
          </div>
        </div>
      )}

      <div className="calc-container">
        <div className="calc-panel" style={{ border: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="font-mono">Platform</label>
              <CustomSelect 
                value={platform} 
                onChange={(val) => setPlatform(val)} 
                options={game.platforms || ['PC', 'PlayStation', 'Xbox']} 
              />
            </div>
            {gameKey === 'cs2' && (
              <div className="form-group" style={{ flex: 1 }}>
                <label className="font-mono">CS2 Mode</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleCs2ModeChange('premier')} 
                    className={`option-btn ${cs2Mode === 'premier' ? 'active' : ''}`} 
                    style={{ padding: '8px 15px' }}
                  >
                    PREMIER
                  </button>
                  <button 
                    onClick={() => handleCs2ModeChange('faceit')} 
                    className={`option-btn ${cs2Mode === 'faceit' ? 'active' : ''}`} 
                    style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <img src="/assets/faceit.png" alt="FACEIT" style={{ width: '16px', height: '16px' }} />
                    FACEIT
                  </button>
                </div>
              </div>
            )}
            {gameKey === 'apex' && (
              <div className="form-group" style={{ flex: 1, display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                <div onClick={() => setBadgeOnly(!badgeOnly)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <div style={{
                    width: '40px', height: '22px', background: badgeOnly ? 'var(--brand)' : 'var(--bg-input)', border: `1px solid ${badgeOnly ? 'var(--brand)' : 'var(--border-light)'}`, borderRadius: '12px', position: 'relative', transition: 'all 0.2s'
                  }}>
                    <div style={{
                      width: '16px', height: '16px', background: badgeOnly ? '#141517' : 'var(--text-muted)', borderRadius: '50%', position: 'absolute', top: '2px', left: badgeOnly ? '20px' : '2px', transition: 'all 0.2s'
                    }} />
                  </div>
                  <span className="font-mono" style={{ color: badgeOnly ? 'var(--brand)' : 'var(--text-main)', fontSize: '0.85rem' }}>Badge Boost Only</span>
                </div>
              </div>
            )}
          </div>

          {badgeOnly ? (
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="font-mono">Which badges / legends? (e.g. 20 Bomb Wraith, 4k Damage)</label>
              <input type="text" className="input-field" value={selectedBadges} onChange={e => setSelectedBadges(e.target.value)} placeholder="Enter details..." />
            </div>
          ) : (
            <div className="rank-row">
            <div className="rank-box">
              <h3>Current Rank</h3>
              <div className="form-group">
                <label className="font-mono">Rank</label>
                <CustomSelect 
                  value={startRank} 
                  onChange={handleStartRankChange} 
                  options={activeRanks.map((r: any) => r.name)} 
                />
              </div>
              {startRankData.divisions.length > 0 && (
                <div className="form-group">
                  <label className="font-mono">Division</label>
                  <CustomSelect 
                    value={startDiv} 
                    onChange={(val) => setStartDiv(val)} 
                    options={startRankData.divisions} 
                  />
                </div>
              )}
              <div className="form-group">
                <label className="font-mono">Current {game.pointsName}</label>
                <input type="text" className="input-field" placeholder={`e.g., 45`} value={startPts} onChange={(e) => setStartPts(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }} className="font-mono">
              ➜
            </div>

            <div className="rank-box">
              <h3>Desired Rank</h3>
              <div className="form-group">
                <label className="font-mono">Target Rank</label>
                <CustomSelect 
                  value={endRank} 
                  onChange={handleEndRankChange} 
                  options={activeRanks.map((r: any) => r.name)} 
                />
              </div>
              {endRankData.divisions.length > 0 && (
                <div className="form-group">
                  <label className="font-mono">Target Division</label>
                  <CustomSelect 
                    value={endDiv} 
                    onChange={(val) => setEndDiv(val)} 
                    options={endRankData.divisions} 
                  />
                </div>
              )}
              <div className="form-group">
                <label className="font-mono">Target {game.pointsName}</label>
                <input type="text" className="input-field" placeholder={`e.g., 0`} value={endPts} onChange={(e) => setEndPts(e.target.value)} />
              </div>
            </div>
            </div>
          )}

          <hr style={{ borderColor: 'var(--border-light)', margin: '20px 0' }} />
          
          <h3 className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>OPTIONS</h3>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button 
              type="button" 
              onClick={() => setOptions({...options, stream: !options.stream})}
              className={`option-btn ${options.stream ? 'active' : ''}`}
            >
              STREAM
            </button>
            <button 
              type="button" 
              onClick={() => setOptions({...options, priority: !options.priority})}
              className={`option-btn ${options.priority ? 'active' : ''}`}
            >
              PRIORITY QUEUE
            </button>
            <button 
              type="button" 
              onClick={() => setOptions({...options, duo: !options.duo})}
              className={`option-btn ${options.duo ? 'active' : ''}`}
            >
              DUO QUEUE
            </button>
            <button 
              type="button" 
              onClick={() => setOptions({...options, offline: !options.offline})}
              className={`option-btn ${options.offline ? 'active' : ''}`}
            >
              OFFLINE / INVISIBLE
            </button>
          </div>
          
          <div className="form-group" style={{ marginTop: '25px' }}>
            <label className="font-mono">Extra Details / Special Requests (Optional)</label>
            <textarea 
              className="input-field" 
              value={extraDetails} 
              onChange={e => setExtraDetails(e.target.value)} 
              placeholder="Any specific legends to play, time restrictions, etc."
              style={{ width: '100%', height: '80px', resize: 'none', padding: '10px' }}
            />
          </div>
        </div>

        <div className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
          <div>
            <h3 className="font-mono" style={{ color: 'var(--brand)', marginBottom: '12px', fontSize: '0.85rem' }}>// ORDER DETAILS</h3>
            <ul className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '20px', lineHeight: '2', listStyle: 'none', padding: 0 }}>
              <li>Estimated Time: 1-2 Days</li>
              <li>Secure Escrow Payment</li>
              <li>Verified Professionals</li>
            </ul>
          </div>
          <button className="btn-primary" onClick={handlePostOrder}>POST ORDER FOR BIDDING</button>
        </div>
      </div>
    </main>
  );
}
