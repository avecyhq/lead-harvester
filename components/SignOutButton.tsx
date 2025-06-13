'use client';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { supabase } from '../lib/supabaseClient';
import { useState } from 'react';

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.push('/auth/signin');
  };

  return (
    <Button onClick={handleSignOut} disabled={loading} variant="outline">
      {loading ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
} 