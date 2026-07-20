import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=no_code', request.url));
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new Response('Discord env vars missing', { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${appUrl}/api/user/link/discord/callback`;

  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errData = await tokenResponse.text();
      console.error('Failed to exchange code:', errData);
      return NextResponse.redirect(new URL('/dashboard/settings?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user profile
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL('/dashboard/settings?error=fetch_user_failed', request.url));
    }

    const discordUser = await userResponse.json();
    const discordId = discordUser.id;
    const discordUsername = `${discordUser.username}${discordUser.discriminator && discordUser.discriminator !== '0' ? `#${discordUser.discriminator}` : ''}`;

    // Verify if this discordId is already linked
    const existingLink = await prisma.user.findUnique({
      where: { discordId },
    });

    const userId = (session.user as any).id;

    if (existingLink) {
      if (existingLink.id === userId) {
        return NextResponse.redirect(new URL('/dashboard/settings?msg=discord_already_linked', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard/settings?error=discord_taken', request.url));
    }

    // Link it
    await prisma.user.update({
      where: { id: userId },
      data: {
        discordId,
        discordUsername,
      },
    });

    return NextResponse.redirect(new URL('/dashboard/settings?msg=discord_linked', request.url));
  } catch (error) {
    console.error('Discord linking error:', error);
    return NextResponse.redirect(new URL('/dashboard/settings?error=internal_error', request.url));
  }
}
