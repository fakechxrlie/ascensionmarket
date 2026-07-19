"use client";
import React, { useState, useEffect } from 'react';

export default function OrderChat({ orderId, boosterId, currentUsername }: { orderId: string, boosterId: string, currentUsername: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    const res = await fetch(`/api/orders/${orderId}/chat?boosterId=${boosterId}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Simple short poll for live chat
    return () => clearInterval(interval);
  }, [orderId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    const res = await fetch(`/api/orders/${orderId}/chat?boosterId=${boosterId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    if (res.ok) {
      setText('');
      fetchMessages();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '300px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
      <div style={{ padding: '10px 15px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)', fontWeight: 600 }}>
        Live Chat
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading chat...</p> : messages.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No messages yet. Say hi!</p> : null}
        {messages.map(msg => {
          const isMe = msg.sender.username === currentUsername;
          return (
            <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', background: isMe ? 'var(--brand)' : 'var(--bg-input)', padding: '8px 12px', borderRadius: '8px', maxWidth: '85%' }}>
              {!isMe && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{msg.sender.username}</div>}
              <div style={{ fontSize: '0.9rem', color: '#fff' }}>{msg.text}</div>
            </div>
          );
        })}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', borderTop: '1px solid var(--border-light)' }}>
        <input type="text" placeholder="Type a message..." value={text} onChange={e => setText(e.target.value)} style={{ flex: 1, padding: '10px 15px', background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none' }} />
        <button type="submit" style={{ background: 'var(--brand)', color: '#fff', border: 'none', padding: '0 20px', cursor: 'pointer', fontWeight: 600 }}>Send</button>
      </form>
    </div>
  );
}
