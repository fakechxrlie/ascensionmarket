import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import OrderChat from '../../components/OrderChat';
import CredentialVault from '../../components/CredentialVault';
import OrderActions from '../../components/OrderActions';
import OrderWorkspace from '../../components/OrderWorkspace';

export default async function OrderCommandCenter({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const user = session.user as any;
  const userId = user.id;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      buyer: true,
      bids: {
        include: { booster: true }
      }
    }
  });

  if (!order) {
    redirect('/dashboard');
  }

  const assignedBooster = order.bids.find(b => b.status === 'ACCEPTED')?.booster;
  const assignedBoosterId = assignedBooster?.id;

  // Verify access: Buyer, Assigned Booster, Owner, or Any Booster on an OPEN order
  const isBuyer = order.buyerId === userId;
  const isAssignedBooster = assignedBoosterId === userId;
  const isOwner = user.role === 'OWNER';
  const isAnyBoosterOpenOrder = user.role === 'BOOSTER' && order.status === 'OPEN';

  if (!isBuyer && !isAssignedBooster && !isOwner && !isAnyBoosterOpenOrder) {
    redirect('/dashboard');
  }

  const isBooster = isAssignedBooster || isAnyBoosterOpenOrder;

  // Calculate timeline steps
  // 1. Placed (Always true)
  // 2. Paid / Escrow Locked (true if status is not OPEN)
  // 3. Booster Assigned (true if we have an accepted bid)
  // 4. Verification/Credentials Vault (true if credentials exist)
  // 5. In Progress (true if status is IN_PROGRESS or PENDING_COMPLETION or COMPLETED)
  // 6. Complete (true if status is COMPLETED)
  const steps = [
    { label: 'Placed', active: true },
    { label: 'Escrow Locked', active: order.status !== 'OPEN' },
    { label: 'Booster Active', active: !!assignedBoosterId },
    { label: 'In Progress', active: ['IN_PROGRESS', 'PENDING_COMPLETION', 'COMPLETED'].includes(order.status) },
    { label: 'Complete', active: order.status === 'COMPLETED' }
  ];

  return (
    <main className="container" style={{ marginTop: '30px', marginBottom: '80px' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '15px', marginBottom: '20px' }}>
        <a href="/dashboard" className="font-mono" style={{ color: 'var(--brand)', textDecoration: 'none', fontSize: '0.8rem' }}>← BACK TO DASHBOARD</a>
        <h1 className="font-mono" style={{ fontSize: '1.6rem', color: 'var(--text-main)', margin: '10px 0 0 0' }}>
          // ORDER COMMAND CENTER
        </h1>
        <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
          Order ID: {order.id} | Game: {order.game}
        </p>
      </div>

      {/* 1. Progression Timeline */}
      <div className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px', marginBottom: '25px' }}>
        <h3 className="font-mono" style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>PROGRESS TIMELINE</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          {/* Background Connector Line */}
          <div style={{ position: 'absolute', top: '15px', left: '20px', right: '20px', height: '2px', background: 'var(--border-light)', zIndex: 1 }} />
          {/* Active Connector Line */}
          <div style={{ 
            position: 'absolute', 
            top: '15px', 
            left: '20px', 
            width: `${((steps.filter(s => s.active).length - 1) / (steps.length - 1)) * 100}%`,
            height: '2px', 
            background: 'var(--brand)', 
            zIndex: 1,
            transition: 'width 0.4s ease'
          }} />

          {steps.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '0%', 
                border: `2px solid ${step.active ? 'var(--brand)' : 'var(--border-light)'}`,
                background: step.active ? 'var(--bg-card)' : 'var(--bg-input)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: step.active ? 'var(--brand)' : 'var(--text-muted)',
                fontWeight: 'bold',
                fontSize: '0.85rem'
              }}>
                {idx + 1}
              </div>
              <span className="font-mono" style={{ fontSize: '0.75rem', marginTop: '8px', color: step.active ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: step.active ? 600 : 400 }}>
                {step.label.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
        {/* Left Side: Order Details & Escrow Vault & Protection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {/* Order specs */}
          <div className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px' }}>
            <h3 className="font-mono" style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ORDER SPECIFICATIONS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="font-mono" style={{ fontSize: '0.9rem' }}>
                Game: <strong style={{ color: 'var(--brand)' }}>{order.game}</strong>
              </div>
              <div className="font-mono" style={{ fontSize: '0.9rem' }}>
                From: <strong>{order.startRank} {order.startDiv}</strong> ➜ To: <strong>{order.targetRank} {order.targetDiv}</strong>
              </div>
              <div className="font-mono" style={{ fontSize: '0.9rem' }}>
                Escrow Locked: <strong style={{ color: 'var(--accent)' }}>${order.escrowAmount.toFixed(2)}</strong>
              </div>
              <div className="font-mono" style={{ fontSize: '0.9rem' }}>
                Assigned Booster: <strong>{assignedBooster ? assignedBooster.username : '[WAITING FOR PAYMENT/ACCEPTANCE]'}</strong>
              </div>
            </div>
          </div>

          {/* Credentials Vault */}
          {order.status !== 'OPEN' && (
            <CredentialVault 
              orderId={order.id} 
              isBuyer={isBuyer} 
              initialCredentials={order.credentials} 
            />
          )}

          {/* Escrow Protection Info & Actions */}
          <div className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px' }}>
            <h3 className="font-mono" style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>🛡️ ESCROW PROTECTION CENTRE</h3>
            <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              This transaction is protected by Ascension Escrow. Funds are locked securely and will only be released to the booster upon completion confirmation or auto-release timer expiration.
            </p>
            
            {order.status === 'PENDING_COMPLETION' && (
              <div className="font-mono" style={{ padding: '8px 12px', background: 'rgba(0, 230, 118, 0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '0.75rem', margin: '15px 0' }}>
                Booster marked this order complete. Please verify in-game before releasing funds.
              </div>
            )}

            {(order.status === 'IN_PROGRESS' || order.status === 'PENDING_COMPLETION') && (
              <div style={{ marginTop: '15px' }}>
                <OrderActions orderId={order.id} status={order.status} />
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Dynamic lower section depending on status */}
        {order.status === 'OPEN' ? (
          <div style={{ marginTop: '30px' }}>
            <OrderWorkspace 
              order={order} 
              currentUserId={userId} 
              currentUsername={session.user?.name || user.username} 
              isBuyer={isBuyer} 
              isBooster={isBooster || (!isBuyer && user.role === 'BOOSTER')} 
            />
          </div>
        ) : (
          <div style={{ marginTop: '30px' }}>
            <div className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px', height: '400px', display: 'flex', flexDirection: 'column' }}>
              <h3 className="font-mono" style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>WORKSPACE CHAT</h3>
              <div style={{ flex: 1 }}>
                {assignedBoosterId ? (
                  <OrderChat 
                    orderId={order.id} 
                    boosterId={assignedBoosterId} 
                    currentUsername={session.user?.name || user.username} 
                    height="100%"
                  />
                ) : (
                  <p className="font-mono" style={{ color: 'var(--text-muted)' }}>[NO BOOSTER ASSIGNED YET]</p>
                )}
              </div>
            </div>
          </div>
        )}
    </main>
  );
}
