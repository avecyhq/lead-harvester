import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import EditLeadModal from '@/components/EditLeadModal';
import { Edit } from 'lucide-react';
import { Lead } from '@/lib/supabase';
import LeadsTableClient from './LeadsTableClient';

export default async function BatchDetailPage({ params }: { params: { batchId: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .eq('batch_id', params.batchId)
    .order('created_at', { ascending: false });

  // Always show debug info at the top
  const debugInfo = (
    <div className="mb-4 text-xs text-gray-500">Batch ID: {params.batchId} | Leads found: {leads ? leads.length : 0}</div>
  );

  if (!leads || leads.length === 0) {
    return (
      <div className="p-8">
        {debugInfo}
        <Link href="/dashboard" className="text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
        <h2 className="text-2xl font-bold mt-4 mb-2">No leads found for this batch.</h2>
      </div>
    );
  }

  return (
    <div className="p-8">
      {debugInfo}
      <Link href="/dashboard" className="text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
      <h2 className="text-2xl font-bold mt-4 mb-6">Leads for Batch</h2>
      <LeadsTableClient leads={leads} batchId={params.batchId} />
    </div>
  );
} 