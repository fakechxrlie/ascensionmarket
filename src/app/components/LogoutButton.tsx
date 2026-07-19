"use client";
import React from 'react';
import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/' })} 
      className="btn-login" 
      style={{ borderColor: 'var(--accent-secondary)', color: 'var(--text-main)', background: 'transparent', cursor: 'pointer' }}
    >
      Log Out
    </button>
  );
}
