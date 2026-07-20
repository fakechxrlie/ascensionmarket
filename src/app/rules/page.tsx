"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type TabType = 'tos' | 'conduct' | 'escrow' | 'safety';

function RulesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('tos');

  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam && ['tos', 'conduct', 'escrow', 'safety'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    router.replace(`/rules?${params.toString()}`);
  };

  return (
    <main className="container" style={{ marginTop: '40px', marginBottom: '80px' }}>
      
      {/* Header Panel */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        padding: '30px 40px',
        marginBottom: '30px',
        position: 'relative'
      }}>
        <h1 className="font-mono" style={{ fontSize: '1.8rem', margin: '0 0 10px 0', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
          // REGULATORY FRAMEWORK & RULES
        </h1>
        <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
          VERSION 1.0 // COMPLIANCE GUIDELINES
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
        
        {/* Sidebar Navigation (Tabs) */}
        <div>
          <div className="panel" style={{ padding: 0 }}>
            <div style={{
              borderBottom: '1px solid var(--border-light)',
              padding: '12px 16px',
              background: 'var(--bg-input)'
            }}>
              <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                SECTIONS
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                onClick={() => handleTabChange('tos')}
                className="font-mono"
                style={{
                  background: activeTab === 'tos' ? 'var(--border-light)' : 'transparent',
                  border: 'none',
                  borderLeft: activeTab === 'tos' ? '3px solid var(--brand)' : '3px solid transparent',
                  color: activeTab === 'tos' ? 'var(--brand)' : 'var(--text-muted)',
                  padding: '14px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.1s'
                }}
              >
                [01] TERMS OF SERVICE
              </button>

              <button
                onClick={() => handleTabChange('conduct')}
                className="font-mono"
                style={{
                  background: activeTab === 'conduct' ? 'var(--border-light)' : 'transparent',
                  border: 'none',
                  borderLeft: activeTab === 'conduct' ? '3px solid var(--brand)' : '3px solid transparent',
                  color: activeTab === 'conduct' ? 'var(--brand)' : 'var(--text-muted)',
                  padding: '14px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.1s'
                }}
              >
                [02] BOOSTER RULES & FEES
              </button>

              <button
                onClick={() => handleTabChange('escrow')}
                className="font-mono"
                style={{
                  background: activeTab === 'escrow' ? 'var(--border-light)' : 'transparent',
                  border: 'none',
                  borderLeft: activeTab === 'escrow' ? '3px solid var(--brand)' : '3px solid transparent',
                  color: activeTab === 'escrow' ? 'var(--brand)' : 'var(--text-muted)',
                  padding: '14px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.1s'
                }}
              >
                [03] ESCROW SYSTEM
              </button>

              <button
                onClick={() => handleTabChange('safety')}
                className="font-mono"
                style={{
                  background: activeTab === 'safety' ? 'var(--border-light)' : 'transparent',
                  border: 'none',
                  borderLeft: activeTab === 'safety' ? '3px solid var(--brand)' : '3px solid transparent',
                  color: activeTab === 'safety' ? 'var(--brand)' : 'var(--text-muted)',
                  padding: '14px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.1s'
                }}
              >
                [04] ACCOUNT PROTECTION
              </button>
            </div>
          </div>

          <div className="panel font-mono" style={{ marginTop: '16px', fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>🛡️ ESCROW PROTECTION</strong>
            Payments are held securely by the platform and only released to boosters when the job is completed and verified.
          </div>
        </div>

        {/* Content Panel */}
        <div className="panel" style={{ padding: '30px' }}>
          
          {activeTab === 'tos' && (
            <div>
              <h2 className="font-mono" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--brand)', fontSize: '1.2rem' }}>
                // TERMS OF SERVICE (TOS)
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                <p>
                  Welcome to Ascension Boosting (&quot;Platform&quot;). These Terms of Service constitute a binding digital contract governing your access and use of the website, marketplace, and escrow services. By placing an order, registering an account, or submitting a booster application, you agree to these terms in their entirety.
                </p>

                <div style={{ borderLeft: '2px solid var(--border-light)', paddingLeft: '15px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    1. CONTRACTUAL RELATIONSHIP
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Ascension operates as an escrow facilitator and matchmaking marketplace. All service agreements for game boosting are entered into directly between the client (Buyer) and the chosen service provider (Booster). Ascension is not a party to the direct service agreement but enforces transaction safety, financial vaulting, and dispute resolution.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid var(--border-light)', paddingLeft: '15px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    2. ACCOUNT CREDENTIALS & RISK ACKNOWLEDGEMENT
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
                    Clients utilizing Account Sharing (Piloted) boosts acknowledge that sharing in-game credentials violates the End User License Agreements (EULA) and Terms of Service of third-party game publishers (including but not limited to Riot Games, Respawn Entertainment, Ubisoft, Psyonix, and Epic Games).
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    By submitting credentials, you assume full responsibility for all outcomes, including potential publisher penalties, rank resets, matches disallowed, or account suspensions. Ascension does not warrant against action taken by game publishers.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid var(--border-light)', paddingLeft: '15px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    3. REFUND POLICY GUIDELINES
                  </h3>
                  <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li>
                      <strong>Open Orders:</strong> Full refunds are available if the order remains in an `OPEN` state and has not been claimed by a booster.
                    </li>
                    <li>
                      <strong>In-Progress Orders:</strong> Once a booster has accepted a bid and locked the job, refunds are only issued if the booster fails to perform activity within 24 hours.
                    </li>
                    <li>
                      <strong>Disputed Orders:</strong> If a dispute is raised, refunds are evaluated on a case-by-case basis by the Ascension Admin team, who determines a proportional payout based on the percentage of the boost completed.
                    </li>
                    <li>
                      <strong>Completed Orders:</strong> No refunds are issued once the order status is updated to `COMPLETED` and the escrow funds are released.
                    </li>
                  </ul>
                </div>

                <div style={{ borderLeft: '2px solid var(--border-light)', paddingLeft: '15px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    4. COMPLIANCE & REASONABLE USE
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Users are prohibited from reverse-engineering the platform, bypassing system checks, fabricating proof documents, utilizing exploit tools to alter ranks in order calculations, or executing malicious scripts. Any detected infractions will result in immediate hardware and IP bans.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'conduct' && (
            <div>
              <h2 className="font-mono" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--brand)', fontSize: '1.2rem' }}>
                // BOOSTER RULES & FEES
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                <div style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-light)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <strong className="font-mono" style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>PLATFORM SERVICE COMMISSION</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Deducted automatically from completed order payouts.</div>
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent)' }}>
                    10%
                  </div>
                </div>

                <p>
                  As a verified Ascension booster, you represent the elite tier of the boosting marketplace. You are held to a strict code of professionalism, security, and game compliance. Violation of these regulations is met with a zero-tolerance policy.
                </p>

                <div style={{ borderLeft: '2px solid var(--border-light)', paddingLeft: '15px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    1. ZERO-TOLERANCE: OFF-PLATFORM TRANSACTIONS
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
                    Boosters must never invite, suggest, or facilitate clients to transact outside the Ascension platform. Direct payment processing through PayPal, crypto wallets, or third-party marketplaces is strictly forbidden.
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    All communication must take place in the order&apos;s active chat workspace. Exchanging Discord tags, phone numbers, or social handles with clients results in <strong>immediate account termination</strong> and the forfeiture of all locked and pending escrow balances.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid var(--border-light)', paddingLeft: '15px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    2. ZERO-TOLERANCE: CHEATING, SCRIPTING, BOT-LOBBIES
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Boosters must play using raw skill only. The use of cheats, scripts, ESP hacks, aimbots, radar overlays, lobby-manipulation exploits, or bot-farming networks is strictly forbidden. If an account is flagged for ban by publisher anti-cheat software (e.g., Vanguard, Ricochet, EAC) during or shortly after your boost, your credentials will be permanently banned and your earnings withheld.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid var(--border-light)', paddingLeft: '15px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    3. BINDING BIDS & PRICING LOCKED
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    When you place a bid on the Job Board, that number is a binding contract. If the client accepts, you are obligated to complete the boost for the bid amount. Requesting extra tips, negotiating a higher rate after winning, or holding a client&apos;s account hostage for more money is grounds for immediate termination.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid var(--border-light)', paddingLeft: '15px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    4. SERVICE SPEED & PUNCTUALITY
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Active orders must see consistent daily play. A booster should play at least 3-5 games per day on an active assignment. If an order remains untouched for more than 48 hours without prior communication with the buyer, the order may be cancelled by the system, returned to the open marketplace, and the booster penalized.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'escrow' && (
            <div>
              <h2 className="font-mono" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--brand)', fontSize: '1.2rem' }}>
                // ESCROW SYSTEM
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                <p>
                  Ascension uses an escrow system to ensure safe transactions. Funds are held securely by the platform and are only released once the boost is completed.
                </p>

                {/* Escrow Flow Steps */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', margin: '10px 0' }}>
                  <div className="panel" style={{ background: 'var(--bg-input)' }}>
                    <div className="font-mono" style={{ color: 'var(--brand)', fontSize: '0.8rem', marginBottom: '6px' }}>STAGE 01</div>
                    <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>DEPOSIT</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      Buyer accepts bid and pays. Funds are locked in escrow.
                    </span>
                  </div>

                  <div className="panel" style={{ background: 'var(--bg-input)' }}>
                    <div className="font-mono" style={{ color: 'var(--brand)', fontSize: '0.8rem', marginBottom: '6px' }}>STAGE 02</div>
                    <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>WORK ACTIVE</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      Booster gains access to details and performs the boost.
                    </span>
                  </div>

                  <div className="panel" style={{ background: 'var(--bg-input)' }}>
                    <div className="font-mono" style={{ color: 'var(--brand)', fontSize: '0.8rem', marginBottom: '6px' }}>STAGE 03</div>
                    <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>INSPECTION</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      Booster marks job complete. Buyer inspects in-game status.
                    </span>
                  </div>

                  <div className="panel" style={{ background: 'var(--bg-input)' }}>
                    <div className="font-mono" style={{ color: 'var(--accent)', fontSize: '0.8rem', marginBottom: '6px' }}>STAGE 04</div>
                    <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>RELEASE</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      Funds release to booster (90%) and platform (10%).
                    </span>
                  </div>
                </div>

                <div style={{ borderLeft: '2px solid var(--border-light)', paddingLeft: '15px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    1. 72-HOUR AUTO-RELEASE
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    When a booster completes a job, you have 72 hours to verify that the target rank has been reached. If you do not approve the job or open a dispute within 72 hours, the platform automatically releases the payment to the booster.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid var(--border-light)', paddingLeft: '15px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    2. DISPUTES
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    If there is an issue with the order, you can open a dispute. This freezes the escrow funds. Our support team will review the chat logs and account status to resolve the case fairly.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid var(--border-light)', paddingLeft: '15px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    3. REFUNDS & PRO-RATA RESOLUTIONS
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    If a boost is only partially completed, our team will calculate the progress made and split the escrow payout proportionally between the buyer and the booster. Admin decisions on dispute settlements are final.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'safety' && (
            <div>
              <h2 className="font-mono" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--brand)', fontSize: '1.2rem' }}>
                // ACCOUNT PROTECTION
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                <p>
                  We prioritize your account security. Boosters are required to follow strict security guidelines to protect your credentials and prevent publisher detection.
                </p>

                <div style={{ borderLeft: '2px solid var(--border-light)', paddingLeft: '15px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    1. VPN MATCHING
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Boosters must use a VPN set to your country and region when logging in. This matches your normal login patterns and helps prevent suspicious activity flags from the game publisher.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid var(--border-light)', paddingLeft: '15px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    2. STEALTH MODE
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Boosters must play in offline mode where supported. They are prohibited from talking to your friends, replying to messages, or changing any client settings without your permission.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid var(--border-light)', paddingLeft: '15px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    3. CREDENTIAL ENCRYPTION
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Your password is encrypted and is only visible to the assigned booster while they are working on your order. Credentials are removed from the booster&apos;s panel once the job is marked complete.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid var(--border-light)', paddingLeft: '15px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    4. BAN REFUNDS
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    If an account is banned during the boost due to the booster&apos;s actions (such as cheating or toxic behavior), you will receive a 100% refund.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

export default function RulesPage() {
  return (
    <Suspense fallback={
      <main className="container font-mono" style={{ marginTop: '40px', marginBottom: '80px', color: 'var(--text-muted)' }}>
        Loading Ascension Regulatory Framework...
      </main>
    }>
      <RulesContent />
    </Suspense>
  );
}
