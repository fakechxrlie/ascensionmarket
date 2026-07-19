import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { decrypt } from '@/lib/encryption';
import React from 'react';
import OwnerUsersTab from './OwnerUsersTab';
import OwnerOrdersTab from './OwnerOrdersTab';

export default async function OwnerPanel({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'OWNER') {
    redirect('/dashboard');
  }

  const sParams = await searchParams;
  const tab = sParams.tab || 'applications';

  async function reviewApplication(formData: FormData) {
    "use server";
    const appId = formData.get('appId') as string;
    const action = formData.get('action') as string;
    
    const application = await prisma.boosterApplication.findUnique({ where: { id: appId } });
    if (!application) return;

    if (action === 'APPROVE') {
      await prisma.$transaction([
        prisma.boosterApplication.update({ where: { id: appId }, data: { status: 'APPROVED' } }),
        prisma.user.update({ where: { id: application.userId }, data: { role: 'BOOSTER' } })
      ]);
    } else {
      await prisma.boosterApplication.update({ where: { id: appId }, data: { status: 'REJECTED' } });
    }
    revalidatePath('/owner');
  }

  async function updateUserRole(formData: FormData) {
    "use server";
    const userId = formData.get('userId') as string;
    const role = formData.get('role') as string;
    await prisma.user.update({ where: { id: userId }, data: { role } });
    revalidatePath('/owner');
  }

  async function toggleUserBan(formData: FormData) {
    "use server";
    const userId = formData.get('userId') as string;
    const isBanned = formData.get('isBanned') === 'true';
    
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { isBanned } }),
      prisma.userLog.create({ data: { userId, action: isBanned ? 'BANNED_BY_ADMIN' : 'UNBANNED_BY_ADMIN' } })
    ]);
    
    revalidatePath('/owner');
  }

  async function updateOrderStatus(formData: FormData) {
    "use server";
    const orderId = formData.get('orderId') as string;
    const status = formData.get('status') as string;
    await prisma.order.update({ where: { id: orderId }, data: { status } });
    revalidatePath('/owner');
  }

  async function resolveDispute(formData: FormData) {
    "use server";
    const orderId = formData.get('orderId') as string;
    const winner = formData.get('winner') as string;
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { bids: { where: { status: 'ACCEPTED' } } }
    });
    
    if (order && order.status === 'DISPUTED') {
      const targetUserId = winner === 'BOOSTER' ? order.bids[0]?.boosterId : order.buyerId;
      if (targetUserId) {
        const payout = winner === 'BOOSTER' ? order.escrowAmount * 0.85 : order.escrowAmount;
        await prisma.$transaction([
          prisma.user.update({
            where: { id: targetUserId },
            data: { balance: { increment: payout } }
          }),
          prisma.order.update({
            where: { id: orderId },
            data: { status: winner === 'BUYER' ? 'CANCELLED' : 'COMPLETED', escrowAmount: 0 }
          })
        ]);
        revalidatePath('/owner');
      }
    }
  }

  const applications = tab === 'applications' ? await prisma.boosterApplication.findMany({
    where: { status: 'PENDING' },
    include: { user: { select: { username: true, email: true } } }
  }) : [];

  const users = tab === 'users' ? await prisma.user.findMany({ 
    include: { userLogs: { orderBy: { createdAt: 'desc' } } },
    orderBy: { createdAt: 'desc' } 
  }) : [];
  
  const orders = tab === 'orders' ? await prisma.order.findMany({
    include: { buyer: true, bids: { where: { status: 'ACCEPTED' }, include: { booster: true } } },
    orderBy: { createdAt: 'desc' }
  }) : [];

  const disputes = tab === 'disputes' ? await prisma.order.findMany({
    where: { status: 'DISPUTED' },
    include: { buyer: true, bids: { where: { status: 'ACCEPTED' }, include: { booster: true } } },
    orderBy: { createdAt: 'desc' }
  }) : [];

  return (
    <main className="container">
      <div style={{ marginTop: '40px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="font-mono" style={{ fontSize: '1.6rem', color: 'var(--brand)', margin: 0 }}>
            // OWNER CONTROL PANEL
          </h1>
          <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
            MANAGE USERS, ORDERS, AND APPLICATIONS
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="/owner?tab=applications" className="font-mono" style={{ padding: '6px 12px', border: `1px solid ${tab === 'applications' ? 'var(--brand)' : 'var(--border-light)'}`, color: tab === 'applications' ? 'var(--brand)' : 'var(--text-muted)', textDecoration: 'none', background: tab === 'applications' ? 'rgba(0, 230, 118, 0.1)' : 'transparent' }}>APPLICATIONS</a>
          <a href="/owner?tab=users" className="font-mono" style={{ padding: '6px 12px', border: `1px solid ${tab === 'users' ? 'var(--brand)' : 'var(--border-light)'}`, color: tab === 'users' ? 'var(--brand)' : 'var(--text-muted)', textDecoration: 'none', background: tab === 'users' ? 'rgba(0, 230, 118, 0.1)' : 'transparent' }}>USERS</a>
          <a href="/owner?tab=orders" className="font-mono" style={{ padding: '6px 12px', border: `1px solid ${tab === 'orders' ? 'var(--brand)' : 'var(--border-light)'}`, color: tab === 'orders' ? 'var(--brand)' : 'var(--text-muted)', textDecoration: 'none', background: tab === 'orders' ? 'rgba(0, 230, 118, 0.1)' : 'transparent' }}>ORDERS</a>
          <a href="/owner?tab=disputes" className="font-mono" style={{ padding: '6px 12px', border: `1px solid ${tab === 'disputes' ? 'var(--brand)' : 'var(--border-light)'}`, color: tab === 'disputes' ? 'var(--brand)' : 'var(--text-muted)', textDecoration: 'none', background: tab === 'disputes' ? 'rgba(0, 230, 118, 0.1)' : 'transparent' }}>DISPUTES</a>
        </div>
      </div>

      <div style={{ marginTop: '30px', marginBottom: '80px' }}>
        
        {/* --- APPLICATIONS TAB --- */}
        {tab === 'applications' && (
          <div>
            {applications.length === 0 ? (
              <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                [NO PENDING APPLICATIONS]
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {applications.map(app => {
                  const decryptedKyc = decrypt(app.kycData);
                  let kycParsed = { doc1: '', doc2: '', dob: '', country: '', stateRegion: '' };
                  try {
                    kycParsed = { ...kycParsed, ...JSON.parse(decryptedKyc) };
                  } catch (e) {
                    kycParsed.doc1 = decryptedKyc;
                  }

                  let gameUsernamesObj: Record<string, string> = {};
                  try {
                    gameUsernamesObj = JSON.parse(decrypt(app.gameUsernames));
                  } catch (e) {
                    gameUsernamesObj = { 'Primary': decrypt(app.gameUsernames) };
                  }

                  let skillProofsObj: Record<string, string> = {};
                  try {
                    skillProofsObj = JSON.parse(decrypt(app.skillProof));
                  } catch (e) {
                    skillProofsObj = { 'Legacy Proof': decrypt(app.skillProof) };
                  }

                  let gamesArr: string[] = [];
                  try {
                    gamesArr = JSON.parse(app.games);
                  } catch (e) {
                    gamesArr = [app.games];
                  }

                  return (
                    <div key={app.id} className="panel" style={{ background: 'var(--bg-card)', padding: '20px', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h3 className="font-mono" style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>
                          User: {app.user.username} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>({app.user.email})</span>
                        </h3>
                        <span className="font-mono" style={{ fontSize: '0.75rem', padding: '2px 8px', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)', background: 'rgba(239, 68, 68, 0.1)' }}>
                          STATUS: PENDING VERIFICATION
                        </span>
                      </div>
                      
                      <div style={{ padding: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.85rem' }}>
                        
                        {/* Render Personal Details if available */}
                        {kycParsed.dob && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            <div><strong style={{ color: 'var(--text-main)' }} className="font-mono">DOB:</strong> {kycParsed.dob}</div>
                            <div><strong style={{ color: 'var(--text-main)' }} className="font-mono">COUNTRY:</strong> {kycParsed.country}</div>
                            <div><strong style={{ color: 'var(--text-main)' }} className="font-mono">REGION:</strong> {kycParsed.stateRegion}</div>
                          </div>
                        )}

                        <div style={{ borderTop: kycParsed.dob ? '1px solid var(--border-light)' : 'none', paddingTop: kycParsed.dob ? '10px' : '0' }}>
                          <strong style={{ color: 'var(--text-main)' }} className="font-mono">APPLIED GAMES:</strong> {gamesArr.join(', ')}
                        </div>
                        
                        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                          <strong style={{ color: 'var(--text-main)' }} className="font-mono">ACCOUNTS & SCREENSHOTS:</strong>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                            {gamesArr.map(g => {
                              const username = gameUsernamesObj[g] || 'N/A';
                              const proof = skillProofsObj[g];
                              const isBase64Proof = proof?.startsWith('data:image/');

                              return (
                                <div key={g} style={{ background: 'var(--bg-card)', padding: '10px', border: '1px solid var(--border-light)' }}>
                                  <div className="font-mono" style={{ color: 'var(--brand)', fontWeight: 600 }}>{g.toUpperCase()}</div>
                                  <div style={{ marginTop: '4px' }}>Username: <strong>{username}</strong></div>
                                  {proof && (
                                    <div style={{ marginTop: '8px' }}>
                                      <div>Rank Proof:</div>
                                      {isBase64Proof ? (
                                        <a href={proof} target="_blank" rel="noopener noreferrer">
                                          <img src={proof} alt={`${g} Proof`} style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain', border: '1px solid var(--border-light)', cursor: 'pointer', marginTop: '4px' }} />
                                        </a>
                                      ) : (
                                        <span style={{ wordBreak: 'break-all', color: 'var(--brand)' }}>{proof}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          <div>
                            <strong style={{ color: 'var(--text-main)' }} className="font-mono">DOCUMENT 1 (Face + ID):</strong>
                            {kycParsed.doc1?.startsWith('data:image/') ? (
                              <a href={kycParsed.doc1} target="_blank" rel="noopener noreferrer">
                                <img src={kycParsed.doc1} alt="Doc 1" style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain', border: '1px solid var(--border-light)', marginTop: '6px' }} />
                              </a>
                            ) : (
                              <div className="font-mono" style={{ wordBreak: 'break-all', marginTop: '4px', color: 'var(--brand)' }}>{kycParsed.doc1}</div>
                            )}
                          </div>

                          <div>
                            <strong style={{ color: 'var(--text-main)' }} className="font-mono">DOCUMENT 2 (ID Front Only):</strong>
                            {kycParsed.doc2?.startsWith('data:image/') ? (
                              <a href={kycParsed.doc2} target="_blank" rel="noopener noreferrer">
                                <img src={kycParsed.doc2} alt="Doc 2" style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain', border: '1px solid var(--border-light)', marginTop: '6px' }} />
                              </a>
                            ) : (
                              <div className="font-mono" style={{ wordBreak: 'break-all', marginTop: '4px', color: 'var(--brand)' }}>{kycParsed.doc2}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <form action={reviewApplication}>
                          <input type="hidden" name="appId" value={app.id} />
                          <input type="hidden" name="action" value="APPROVE" />
                          <button type="submit" className="btn-primary" style={{ padding: '6px 16px', width: 'auto', background: 'var(--accent)', borderColor: 'var(--accent)', color: '#141517' }}>
                            APPROVE APPLICATION
                          </button>
                        </form>
                        <form action={reviewApplication}>
                          <input type="hidden" name="appId" value={app.id} />
                          <input type="hidden" name="action" value="REJECT" />
                          <button type="submit" className="btn-primary" style={{ padding: '6px 16px', width: 'auto', background: 'transparent', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)' }}>
                            REJECT
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- USERS TAB --- */}
        {tab === 'users' && (
          <OwnerUsersTab users={users} updateUserRole={updateUserRole} toggleUserBan={toggleUserBan} />
        )}

        {/* --- ORDERS TAB --- */}
        {tab === 'orders' && (
          <OwnerOrdersTab orders={orders} updateOrderStatus={updateOrderStatus} resolveDispute={resolveDispute} />
        )}

        {/* --- DISPUTES TAB --- */}
        {tab === 'disputes' && (
          <OwnerOrdersTab orders={disputes} updateOrderStatus={updateOrderStatus} resolveDispute={resolveDispute} />
        )}

      </div>
    </main>
  );
}
