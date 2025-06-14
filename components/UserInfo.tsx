'use client';
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function UserInfo() {
  const [email, setEmail] = useState<string | null>(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
    };
    getUser();
  }, [supabase]);

  if (!email) return null;

  return (
    <span className="text-sm text-gray-700 mr-4">{email}</span>
  );
} 