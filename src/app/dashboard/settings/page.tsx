import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id }
  });

  if (!user) {
    redirect('/login');
  }

  const isBoosterOrOwner = user.role === 'BOOSTER' || user.role === 'OWNER';

  async function updateSettings(formData: FormData) {
    "use server";
    const avatarUrl = formData.get('avatarUrl') as string;
    const slogan = formData.get('slogan') as string;
    const payoutMethod = formData.get('payoutMethod') as string;
    const payoutAddress = formData.get('payoutAddress') as string;
    
    const { prisma } = await import('@/lib/prisma');
    
    // Server-side validation
    let finalAvatar = avatarUrl;
    if (avatarUrl && avatarUrl.toLowerCase().endsWith('.gif')) {
      if ((user?.level || 1) < 10) {
        // Revert to old avatar if they try to cheat the client side validation
        finalAvatar = user?.avatarUrl || '';
      }
    }

    await prisma.user.update({
      where: { id: (session?.user as any).id },
      data: {
        avatarUrl: finalAvatar,
        slogan: slogan.substring(0, 100),
        ...(isBoosterOrOwner && { payoutMethod, payoutAddress })
      }
    });

    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard');
    redirect('/dashboard');
  }

  return (
    <main className="container">
      <div style={{ marginTop: '30px', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px' }}>
        <h1 className="font-mono" style={{ fontSize: '1.6rem', color: 'var(--text-main)', margin: 0 }}>
          // ACCOUNT SETTINGS
        </h1>
        <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
          Manage your public profile and preferences.
        </p>
      </div>

      <div style={{ marginTop: '30px', maxWidth: '600px' }}>
        <form action={updateSettings} className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="input-group">
            <label className="font-mono" style={{ fontSize: '0.85rem' }}>PROFILE PICTURE URL</label>
            <input 
              type="url" 
              name="avatarUrl" 
              defaultValue={user.avatarUrl || ''} 
              placeholder="e.g. https://imgur.com/image.png" 
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
            />
          </div>

          {isBoosterOrOwner && (
            <>
              <hr style={{ borderColor: 'var(--border-light)', margin: '10px 0' }} />
              
              <h3 className="font-mono" style={{ fontSize: '1rem', margin: 0 }}>PAYOUT PREFERENCES</h3>
              
              <div className="input-group">
                <label className="font-mono" style={{ fontSize: '0.85rem' }}>PAYOUT METHOD</label>
                <select name="payoutMethod" defaultValue={user.payoutMethod || ''} style={{ width: '100%', padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: '#fff', borderRadius: '4px', outline: 'none' }}>
                  <option value="">Select a method...</option>
                  <option value="Crypto">Crypto (USDT/BTC)</option>
                  <option value="CashApp">CashApp</option>
                  <option value="PayPal">PayPal</option>
                </select>
              </div>

              <div className="input-group">
                <label className="font-mono" style={{ fontSize: '0.85rem' }}>PAYOUT ADDRESS / TAG</label>
                <input 
                  type="text" 
                  name="payoutAddress" 
                  defaultValue={user.payoutAddress || ''} 
                  placeholder="Your crypto address, $Cashtag, or email" 
                />
              </div>
            </>
          )}

          <div style={{ marginTop: '10px', display: 'flex', gap: '15px' }}>
            <button type="submit" className="btn-primary" style={{ padding: '10px 25px' }}>
              SAVE CHANGES
            </button>
            <a href="/dashboard" style={{ textDecoration: 'none' }}>
              <button type="button" className="btn-primary" style={{ padding: '10px 25px', background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}>
                CANCEL
              </button>
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
