import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import VerifyForm from './VerifyForm';

export default async function VerifyPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login?mode=login&callbackUrl=/verify');
  }

  return <VerifyForm />;
}
