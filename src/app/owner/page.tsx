import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { decrypt } from '@/lib/encryption';

export default async function OwnerPanel() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'OWNER') {
    redirect('/dashboard');
  }

  const applications = await prisma.boosterApplication.findMany({
    where: { status: 'PENDING' },
    include: { user: { select: { username: true, email: true } } }
  });

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

  return (
    <main className="container">
      <div style={{ marginTop: '40px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        <h1 className="font-mono" style={{ fontSize: '1.6rem', color: 'var(--brand)', margin: 0 }}>
          // OWNER CONTROL PANEL
        </h1>
        <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
          REVIEW PENDING BOOSTER APPLICATIONS
        </p>
      </div>

      <div style={{ marginTop: '30px', marginBottom: '80px' }}>
        {applications.length === 0 ? (
          <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            [NO PENDING APPLICATIONS]
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {applications.map(app => {
              const decryptedKyc = decrypt(app.kycData);
              let kycParsed = { doc1: '', doc2: '' };
              try {
                kycParsed = JSON.parse(decryptedKyc);
              } catch (e) {
                kycParsed = { doc1: decryptedKyc, doc2: 'N/A' };
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
                  
                  <div style={{ padding: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: '1fr', gap: '10px', fontSize: '0.85rem' }}>
                    <div><strong style={{ color: 'var(--text-main)' }} className="font-mono">GAMES:</strong> {JSON.parse(app.games).join(', ')}</div>
                    <div><strong style={{ color: 'var(--text-main)' }} className="font-mono">GAME USERNAMES:</strong> {Object.values(JSON.parse(decrypt(app.gameUsernames))).join(', ')}</div>
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: '5px' }}>
                      <strong style={{ color: 'var(--text-main)' }} className="font-mono">DOCUMENT 1 (ID next to face):</strong>
                      <div className="font-mono" style={{ wordBreak: 'break-all', marginTop: '4px', color: 'var(--brand)' }}>{kycParsed.doc1}</div>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-main)' }} className="font-mono">DOCUMENT 2 (Front of ID):</strong>
                      <div className="font-mono" style={{ wordBreak: 'break-all', marginTop: '4px', color: 'var(--brand)' }}>{kycParsed.doc2}</div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: '5px' }}>
                      <strong style={{ color: 'var(--text-main)' }} className="font-mono">RANK SCREENSHOT REFERRAL:</strong> 
                      <div className="font-mono" style={{ wordBreak: 'break-all', marginTop: '4px', color: 'var(--brand)' }}>{decrypt(app.skillProof)}</div>
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
    </main>
  );
}
