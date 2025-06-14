'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';

export default function PasswordResetConfirmPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useSupabaseClient();

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else {
      setSuccess('Password updated! You can now sign in.');
      setTimeout(() => router.push('/auth/signin'), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Set New Password</h1>
      <form onSubmit={handleSetPassword} className="space-y-4 max-w-sm w-full">
        <Input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Updating...' : 'Set Password'}
        </Button>
      </form>
    </div>
  );
} 