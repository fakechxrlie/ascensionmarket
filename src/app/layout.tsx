import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LogoutButton from "./components/LogoutButton";

export const metadata: Metadata = {
  title: "Ascension - Premium Compliance Boosting",
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
            <a href="/" className="logo">// ASCENSION</a>
            <div className="nav-links">
              <a href="/market">Marketplace</a>
              {session ? (
                <>
                  <a href="/dashboard">Dashboard</a>
                  {(session.user as any).role === "OWNER" && (
                    <>
                      <a href="/jobs">Job Board</a>
                      <a href="/owner">Owner Panel</a>
                    </>
                  )}
                  {(session.user as any).role === "BOOSTER" && <a href="/jobs">Job Board</a>}
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
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
// Trigger deploy: direct checkout integration
