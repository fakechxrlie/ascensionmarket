"use client";
import React, { useState } from 'react';

export default function OwnerUsersTab({ 
  users, 
  updateUserRole, 
  toggleUserBan 
}: { 
  users: any[], 
  updateUserRole: (formData: FormData) => void,
  toggleUserBan: (formData: FormData) => void
}) {
  const [search, setSearch] = useState('');
  const [selectedLogs, setSelectedLogs] = useState<any[] | null>(null);

  const filtered = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.ipAddress && u.ipAddress.includes(search))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <input 
        type="text" 
        placeholder="Search users by username, email, or IP..." 
        className="input-field" 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        style={{ marginBottom: '10px' }}
      />
      
      {selectedLogs && (
        <div className="panel" style={{ background: 'var(--bg-input)', border: '1px solid var(--brand)', padding: '15px', position: 'relative' }}>
          <button type="button" onClick={() => setSelectedLogs(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>[X] CLOSE</button>
          <h4 className="font-mono" style={{ margin: '0 0 10px 0', color: 'var(--brand)' }}>User Action Logs</h4>
          {selectedLogs.length === 0 ? <p className="font-mono" style={{ fontSize: '0.8rem' }}>No logs found.</p> : (
            <div style={{ display: 'grid', gap: '5px', maxHeight: '300px', overflowY: 'auto' }}>
              {selectedLogs.map((log: any) => (
                <div key={log.id} className="font-mono" style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString()}</span>
                  <strong style={{ color: 'var(--accent)' }}>[{log.action}]</strong>
                  <span>{log.ipAddress || 'Unknown IP'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gap: '15px' }}>
        {filtered.map(u => (
          <div key={u.id} className="panel" style={{ background: 'var(--bg-card)', padding: '15px', border: `1px solid ${u.isBanned ? 'var(--accent-secondary)' : 'var(--border-light)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h4 className="font-mono" style={{ margin: 0, color: u.isBanned ? 'var(--accent-secondary)' : 'var(--text-main)', fontSize: '1rem', textDecoration: u.isBanned ? 'line-through' : 'none' }}>
                {u.username} {u.isBanned && '[BANNED]'}
              </h4>
              <div className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                {u.email} | Joined: {new Date(u.createdAt).toLocaleDateString()} | IP: {u.ipAddress || 'N/A'}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                type="button"
                onClick={() => setSelectedLogs(u.userLogs)} 
                className="btn-primary font-mono" 
                style={{ padding: '4px 8px', fontSize: '0.7rem', width: 'auto', background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-main)' }}
              >
                VIEW LOGS
              </button>

              <form action={updateUserRole} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input type="hidden" name="userId" value={u.id} />
                <select name="role" defaultValue={u.role} className="input-field" style={{ padding: '4px 8px', margin: 0, fontSize: '0.75rem', height: 'auto' }}>
                  <option value="USER">USER</option>
                  <option value="BOOSTER">BOOSTER</option>
                  <option value="OWNER">OWNER</option>
                </select>
                <button type="submit" className="btn-primary" style={{ padding: '4px 8px', width: 'auto', fontSize: '0.7rem' }}>SET ROLE</button>
              </form>
              
              <form action={toggleUserBan} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input type="hidden" name="userId" value={u.id} />
                <input type="hidden" name="isBanned" value={u.isBanned ? 'false' : 'true'} />
                <button type="submit" className="btn-primary" style={{ padding: '4px 8px', width: 'auto', fontSize: '0.7rem', background: 'transparent', border: `1px solid var(--accent-secondary)`, color: 'var(--accent-secondary)' }}>
                  {u.isBanned ? 'UNBAN USER' : 'BAN USER'}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
