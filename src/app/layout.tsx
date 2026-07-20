import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LogoutButton from "./components/LogoutButton";

export const metadata: Metadata = {
  title: "Ascension Boosting",
  description: "Automated game boosting dashboard with active escrow routing.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <nav className="navbar">
            <a href="/" className="logo" style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: 'normal' }}>// Ascension</a>
            <div className="nav-links">
              <a href="/market">Marketplace</a>
              {session ? (
                <>
                  <a href="/dashboard">Dashboard</a>
                  {(session.user as any).role === "OWNER" && (
                    <>
                      <a href="/jobs">Job Board</a>
                      <a href="/booster">Booster Hub</a>
                      <a href="/owner">Owner Panel</a>
                    </>
                  )}
                  {(session.user as any).role === "BOOSTER" && (
                    <>
                      <a href="/jobs">Job Board</a>
                      <a href="/booster">Booster Hub</a>
                    </>
                  )}
                  {(session.user as any).role === "USER" && <a href="/verify">Become a Booster</a>}
                  <LogoutButton />
                </>
              ) : (
                <>
                  <a href="/login">Login</a>
                  <a href="/login?mode=signup" className="btn-login">Signup</a>
                </>
              )}
            </div>
          </nav>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 70px)' }}>
            <div style={{ flex: 1 }}>
              {children}
            </div>
            <footer style={{
              background: 'var(--bg-card)',
              borderTop: '1px solid var(--border-light)',
              padding: '40px 16px 50px 16px',
              marginTop: '80px',
              width: '100%',
            }}>
              <div className="container" style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '30px'
              }}>
                <div>
                  <a href="/" className="logo" style={{ textDecoration: 'none', display: 'block', marginBottom: '10px' }}>// ASCENSION</a>
                  <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '400px', lineHeight: '1.5' }}>
                    A decentralized, high-security rank optimization marketplace. 
                    All transactions are escrow-secured and encrypted at rest.
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap' }}>
                  <div>
                    <h4 className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Platform Policies</h4>
                    <div className="font-mono" style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
                      <a href="/rules?tab=tos" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="footer-link">Terms of Service</a>
                      <a href="/rules?tab=conduct" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="footer-link">Booster Conduct & Fees</a>
                      <a href="/rules?tab=escrow" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="footer-link">Escrow Vault Mechanics</a>
                      <a href="/rules?tab=safety" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="footer-link">Safety & Guarantees</a>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Security Metrics</h4>
                    <div className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div>Vault Status: <span style={{ color: 'var(--accent)' }}>ESCROW LOCKED</span></div>
                      <div>Encryption: <span style={{ color: 'var(--brand)' }}>AES-256-GCM</span></div>
                      <div>Node Location: <span style={{ color: 'var(--text-main)' }}>VPN-ROUTE ENFORCED</span></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="container font-mono" style={{
                borderTop: '1px solid var(--border-light)',
                marginTop: '30px',
                paddingTop: '20px',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>&copy; {new Date().getFullYear()} ASCENSION INC. ALL RIGHTS RESERVED.</div>
                <div>CLASSIFIED INFORMATION // SYSTEM ACCESS ENVELOPE</div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
// Trigger deploy: direct checkout integration

