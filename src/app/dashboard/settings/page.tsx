import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    redirect('/login');
  }

  // --- SERVER ACTIONS ---

  async function updateProfile(formData: FormData) {
    "use server";
    const avatarUrl = formData.get('avatarUrl') as string;
    const slogan = formData.get('slogan') as string;
    
    const { prisma } = await import('@/lib/prisma');
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) return;
    
    let finalAvatar = avatarUrl;
    if (avatarUrl && avatarUrl.toLowerCase().endsWith('.gif')) {
      if ((currentUser.level || 1) < 10) {
        finalAvatar = currentUser.avatarUrl || '';
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: finalAvatar,
        slogan: slogan.substring(0, 100)
      }
    });

    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard');
    redirect('/dashboard/settings?msg=profile_updated');
  }

  async function updateUsername(formData: FormData) {
    "use server";
    const newUsername = formData.get('newUsername') as string;
    if (!newUsername || newUsername.length < 3) {
      redirect('/dashboard/settings?error=username_too_short');
    }

    const { prisma } = await import('@/lib/prisma');
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) return;

    // Check 60 days rule
    if (currentUser.lastUsernameChange) {
      const daysSinceChange = (Date.now() - currentUser.lastUsernameChange.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceChange < 60) {
        redirect('/dashboard/settings?error=username_cooldown');
      }
    }

    // Check uniqueness
    const exists = await prisma.user.findUnique({ where: { username: newUsername } });
    if (exists && exists.id !== userId) {
      redirect('/dashboard/settings?error=username_taken');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { 
        username: newUsername,
        lastUsernameChange: new Date()
      }
    });

    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard');
    redirect('/dashboard/settings?msg=username_updated');
  }

  async function updatePassword(formData: FormData) {
    "use server";
    const oldPassword = formData.get('oldPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      redirect('/dashboard/settings?error=password_mismatch');
    }
    if (newPassword.length < 6) {
      redirect('/dashboard/settings?error=password_too_short');
    }

    const { prisma } = await import('@/lib/prisma');
    const bcryptjs = await import('bcryptjs');
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!currentUser) return;

    const isValid = await bcryptjs.compare(oldPassword, currentUser.password);
    if (!isValid) {
      redirect('/dashboard/settings?error=invalid_old_password');
    }

    const hashed = await bcryptjs.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed }
    });

    redirect('/dashboard/settings?msg=password_updated');
  }

  // Calculate days left for username change
  let daysLeft = 0;
  let canChangeUsername = true;
  if (user.lastUsernameChange) {
    const daysSince = (Date.now() - user.lastUsernameChange.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 60) {
      canChangeUsername = false;
      daysLeft = Math.ceil(60 - daysSince);
    }
  }

  return (
    <main className="container" style={{ marginBottom: '80px' }}>
      <div style={{ marginTop: '30px', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px' }}>
        <h1 className="font-mono" style={{ fontSize: '1.6rem', color: 'var(--text-main)', margin: 0 }}>
          // ACCOUNT SETTINGS
        </h1>
        <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
          Manage your public profile and preferences.
        </p>
      </div>

      <div style={{ marginTop: '30px', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* PUBLIC PROFILE */}
        <form action={updateProfile} className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="font-mono" style={{ fontSize: '1rem', margin: 0, color: 'var(--brand)' }}>PUBLIC PROFILE</h3>
          
          <div className="input-group">
            <label className="font-mono" style={{ fontSize: '0.85rem' }}>PROFILE PICTURE URL</label>
            <input 
              type="url" 
              name="avatarUrl" 
              defaultValue={user.avatarUrl || ''} 
              placeholder="e.g. https://imgur.com/image.png"
              className="input-field" 
            />
            <p className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '5px' }}>
              GIF avatars are restricted to Level 10+ Boosters.
            </p>
          </div>

          <div className="input-group">
            <label className="font-mono" style={{ fontSize: '0.85rem' }}>SLOGAN</label>
            <input 
              type="text" 
              name="slogan" 
              defaultValue={user.slogan || ''} 
              placeholder="A short description about yourself..." 
              maxLength={100}
              className="input-field"
            />
          </div>

          <div style={{ marginTop: '10px' }}>
            <button type="submit" className="btn-primary" style={{ padding: '10px 25px', width: 'auto' }}>
              SAVE PROFILE
            </button>
          </div>
        </form>

        {/* CHANGE USERNAME */}
        <form action={updateUsername} className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="font-mono" style={{ fontSize: '1rem', margin: 0, color: 'var(--brand)' }}>CHANGE USERNAME</h3>
          <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            You can change your username once every 60 days.
          </p>

          <div className="input-group">
            <label className="font-mono" style={{ fontSize: '0.85rem' }}>NEW USERNAME</label>
            <input 
              type="text" 
              name="newUsername" 
              defaultValue={user.username} 
              className="input-field"
              disabled={!canChangeUsername}
            />
            {!canChangeUsername && (
              <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '5px' }}>
                You must wait {daysLeft} more days before changing your username again.
              </p>
            )}
          </div>

          <div style={{ marginTop: '10px' }}>
            <button type="submit" className="btn-primary" style={{ padding: '10px 25px', width: 'auto', opacity: canChangeUsername ? 1 : 0.5 }} disabled={!canChangeUsername}>
              UPDATE USERNAME
            </button>
          </div>
        </form>

        {/* CHANGE PASSWORD */}
        <form action={updatePassword} className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="font-mono" style={{ fontSize: '1rem', margin: 0, color: 'var(--brand)' }}>CHANGE PASSWORD</h3>
          
          <div className="input-group">
            <label className="font-mono" style={{ fontSize: '0.85rem' }}>OLD PASSWORD</label>
            <input 
              type="password" 
              name="oldPassword" 
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <label className="font-mono" style={{ fontSize: '0.85rem' }}>NEW PASSWORD</label>
            <input 
              type="password" 
              name="newPassword" 
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <label className="font-mono" style={{ fontSize: '0.85rem' }}>CONFIRM NEW PASSWORD</label>
            <input 
              type="password" 
              name="confirmPassword" 
              className="input-field"
              required
            />
          </div>

          <div style={{ marginTop: '10px' }}>
            <button type="submit" className="btn-primary" style={{ padding: '10px 25px', width: 'auto' }}>
              UPDATE PASSWORD
            </button>
          </div>
        </form>

        {/* LINKED ACCOUNTS */}
        <div className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="font-mono" style={{ fontSize: '1rem', margin: 0, color: '#5865F2' }}>LINKED ACCOUNTS</h3>
          <p className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Connect your Discord account to receive instant notifications about orders and messages.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: 'var(--bg-input)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', background: '#5865F2', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>D</span>
              </div>
              <span className="font-mono" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Discord</span>
            </div>
            <button className="btn-primary" type="button" style={{ padding: '6px 15px', width: 'auto', background: '#5865F2', borderColor: '#5865F2' }}>
              LINK ACCOUNT
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
