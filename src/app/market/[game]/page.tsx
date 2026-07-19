"use client";

import React, { useState } from 'react';
import CustomSelect from '../../components/CustomSelect';

const GAME_DATA: Record<string, any> = {
  valorant: {
    name: 'Valorant',
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

  const [options, setOptions] = useState({
    stream: false,
    priority: false,
    duo: false
  });

  const handleStartRankChange = (val: string) => {
    setStartRank(val);
    const newRankData = game.ranks.find((r: any) => r.name === val);
    if (newRankData && newRankData.divisions.length > 0) {
      setStartDiv(newRankData.divisions[0]);
    } else {
      setStartDiv('');
    }
  };

  const handleEndRankChange = (val: string) => {
    setEndRank(val);
    const newRankData = game.ranks.find((r: any) => r.name === val);
    if (newRankData && newRankData.divisions.length > 0) {
      setEndDiv(newRankData.divisions[0]);
    } else {
      setEndDiv('');
    }
  };

  const startRankData = game.ranks.find((r: any) => r.name === startRank) || game.ranks[0];
  const endRankData = game.ranks.find((r: any) => r.name === endRank) || game.ranks[0];

  const handlePostOrder = async () => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: game.name,
          startRank, startDiv, startPts,
          targetRank: endRank, targetDiv: endDiv, targetPts: endPts,
          options: Object.keys(options).filter(k => options[k as keyof typeof options])
        })
      });
      
      if (res.ok) {
        alert('Order posted successfully! You can view it on your dashboard.');
        window.location.href = '/dashboard';
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to post order');
      }
    } catch (err) {
      alert('An error occurred.');
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

      <div className="calc-container">
        <div className="calc-panel" style={{ border: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
          <div className="rank-row">
            <div className="rank-box">
              <h3>Current Rank</h3>
              <div className="form-group">
                <label className="font-mono">Rank</label>
                <CustomSelect 
                  value={startRank} 
                  onChange={handleStartRankChange} 
                  options={game.ranks.map((r: any) => r.name)} 
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
                  options={game.ranks.map((r: any) => r.name)} 
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
