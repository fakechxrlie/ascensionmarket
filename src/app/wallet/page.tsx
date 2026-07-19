import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function WalletStore() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  const packages = [
    { name: 'Starter Pack', amount: 5, credits: '5.00', price: '$5.00', desc: 'Perfect for quick tests and micro transactions.' },
    { name: 'Bronze Pack', amount: 10, credits: '10.00', price: '$10.00', desc: 'Great for standard boosting options.' },
    { name: 'Silver Pack', amount: 25, credits: '25.00', price: '$25.00', desc: 'Ideal for minor rank promotions.' },
    { name: 'Gold Pack', amount: 50, credits: '50.00', price: '$50.00', desc: 'Ideal for division promotions.' },
    { name: 'Platinum Pack', amount: 100, credits: '100.00', price: '$100.00', desc: 'Best value for high-tier queue boosts.' }
  ];

  return (
    <main className="container">
      <div style={{ marginTop: '40px' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Credits Store</h1>
        <p style={{ color: 'var(--text-muted)' }}>Top up your wallet instantly using Crypto. Funds are credited immediately after payment confirmation.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '20px 30px', borderRadius: '12px', border: '1px solid var(--border-light)', marginTop: '30px' }}>
        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Current Balance</span>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--brand)', margin: '5px 0 0 0' }}>${user?.balance?.toFixed(2) || '0.00'}</h2>
        </div>
        <a href="/dashboard" className="btn-primary" style={{ width: 'auto', background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-main)', padding: '10px 20px', textDecoration: 'none', borderRadius: '6px' }}>Back to Dashboard</a>
      </div>

      {/* Packages */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '40px' }}>
        {packages.map((pkg) => (
          <div key={pkg.amount} className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '25px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.15rem' }}>{pkg.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', minHeight: '35px', margin: '0 0 15px 0' }}>{pkg.desc}</p>
              <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '5px' }}>{pkg.price}</div>
              <div style={{ color: 'var(--brand)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '20px' }}>+{pkg.credits} Credits</div>
            </div>

            <form action="/api/wallet/checkout" method="POST">
              <input type="hidden" name="amount" value={pkg.amount} />
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                Buy with Crypto
              </button>
            </form>
          </div>
        ))}

        {/* Custom Amount Package */}
        <div className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '30px', borderRadius: '12px', gridColumn: '1 / -1', marginTop: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem' }}>Custom Deposit Amount</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Load any custom balance into your wallet. Minimum deposit is $2.00 USD.</p>
          <form action="/api/wallet/checkout" method="POST" style={{ display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <input 
              type="number" 
              name="amount" 
              min="2" 
              step="0.01" 
              className="input-field" 
              placeholder="Enter custom amount ($)" 
              required 
              style={{ flex: 1, margin: 0 }} 
            />
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 30px' }}>
              Buy with Crypto
            </button>
          </form>
        </div>
      </div>

      {/* Transaction History */}
      <div style={{ marginTop: '50px', marginBottom: '80px' }}>
        <h2>Recent Deposits</h2>
        {transactions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>No deposit history yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
            {transactions.map((tx) => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '15px 25px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>${tx.amount.toFixed(2)} USD</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {tx.id} | Date: {tx.createdAt.toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '4px', 
                    fontSize: '0.8rem', 
                    fontWeight: 600,
                    background: tx.status === 'COMPLETED' ? 'rgba(76, 175, 80, 0.1)' : tx.status === 'PENDING' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                    color: tx.status === 'COMPLETED' ? '#4caf50' : tx.status === 'PENDING' ? '#ffc107' : '#f44336'
                  }}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
