import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { notFound } from 'next/navigation';
import Link from 'next/link';

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

  if (error) {
    return <div className="p-8 text-red-600">Error loading leads: {error.message}</div>;
  }
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
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Google Maps</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead: any) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.business_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.address || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.city || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.state || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.phone || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.category || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.average_rating ?? '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.number_of_reviews ?? '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                  {lead.website ? (
                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="hover:underline">Website</a>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                  {lead.google_maps_url ? (
                    <a href={lead.google_maps_url} target="_blank" rel="noopener noreferrer" className="hover:underline">Map</a>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 