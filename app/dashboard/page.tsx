'use client'

import React, { useState, useEffect } from 'react'
import { Lead, Batch } from '@/lib/supabase'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import LeadTable from '@/components/LeadTable'
import { BarChart3, Users, TrendingUp, Target } from 'lucide-react'
import RequireAuth from '../../components/RequireAuth'
import SignOutButton from '../../components/SignOutButton'
import UserInfo from '../../components/UserInfo'
import { useRouter } from 'next/navigation'
import EditLeadModal from '@/components/EditLeadModal'
import { saveAs } from 'file-saver'

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [notExportedOnly, setNotExportedOnly] = useState(false)
  const [jobStatuses, setJobStatuses] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch leads for the authenticated user
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
        if (leadsError) throw leadsError
        setLeads(leadsData || [])
        // Fetch batches for the authenticated user
        const { data: batchesData, error: batchesError } = await supabase
          .from('batches')
          .select('*')
          .order('created_at', { ascending: false })
        if (batchesError) throw batchesError
        setBatches(batchesData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [supabase])

  useEffect(() => {
    const fetchJobStatuses = async () => {
      if (batches.length === 0) return;
      // Fetch job status for each batch by querying scrape_jobs for jobs matching this user's category/location/created_at
      const { data: jobs, error } = await supabase
        .from('scrape_jobs')
        .select('id, status, category, cities, created_at')
        .order('created_at', { ascending: false });
      if (error) return;
      // Map job status to batch by matching category/location/created_at
      const statusMap: Record<string, string> = {};
      for (const batch of batches) {
        const job = jobs.find(j =>
          j.category === batch.business_category &&
          (j.cities?.includes(batch.location) || (Array.isArray(j.cities) && j.cities.includes(batch.location))) &&
          Math.abs(new Date(j.created_at).getTime() - new Date(batch.created_at).getTime()) < 60000 // within 1 min
        );
        if (job) statusMap[batch.id] = job.status;
      }
      setJobStatuses(statusMap);
    };
    fetchJobStatuses();
    const interval = setInterval(fetchJobStatuses, 4000);
    return () => clearInterval(interval);
  }, [batches, supabase]);

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead)
    setEditModalOpen(true)
  }

  const handleSave = async (updated: Partial<Lead>) => {
    if (!selectedLead) return
    try {
      await supabase
        .from('leads')
        .update(updated)
        .eq('id', selectedLead.id)
      // Refresh leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      setLeads(leadsData || [])
      setEditModalOpen(false)
      setSelectedLead(null)
    } catch (error) {
      console.error('Error updating lead:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await supabase
        .from('leads')
        .delete()
        .eq('id', id)
      setLeads(leads.filter(lead => lead.id !== id))
    } catch (error) {
      console.error('Error deleting lead:', error)
    }
  }

  const handleSelectLead = (leadId: string, checked: boolean) => {
    setSelectedLeadIds(prev => checked ? [...prev, leadId] : prev.filter(id => id !== leadId))
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedLeadIds(checked ? leads.map(l => l.id) : [])
  }

  // Filter leads in the UI
  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      search.trim() === '' ||
      (lead.business_name?.toLowerCase().includes(search.toLowerCase()) ||
        lead.category?.toLowerCase().includes(search.toLowerCase()) ||
        lead.city?.toLowerCase().includes(search.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(search.toLowerCase()));
    const matchesExported = !notExportedOnly || !lead.exported_at;
    return matchesSearch && matchesExported;
  });

  const handleExport = async () => {
    try {
      const res = await fetch('/api/leads/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedLeadIds,
          search,
          notExportedOnly,
        }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition');
      let filename = 'leads_harvester_export.csv';
      if (disposition) {
        const match = disposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      saveAs(blob, filename);
      // Optionally, refresh leads to update exported_at
    } catch (err) {
      alert('Export failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const stats = {
    total: leads.length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <RequireAuth>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Overview of your lead generation and management activities
            </p>
          </div>
          <div className="flex items-center gap-4">
            <UserInfo />
            <SignOutButton />
          </div>
        </div>

        {/* Batches Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Scrape History</h2>
          </div>
          <div className="p-6 overflow-x-auto">
            {batches.length === 0 ? (
              <div className="text-center text-gray-500">No batches found. (Check console for debug output)</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"># Leads</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {batches.map((batch) => {
                    const status = jobStatuses[batch.id] || 'completed';
                    let badge;
                    if (status === 'pending' || status === 'processing') {
                      badge = <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">{status}</span>;
                    } else if (status === 'failed') {
                      badge = <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">failed</span>;
                    } else {
                      badge = <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">completed</span>;
                    }
                    return (
                      <tr key={batch.id}>
                        <td className="px-4 py-2 whitespace-nowrap">{batch.business_category}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{batch.location}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{new Date(batch.created_at).toLocaleString()}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{batch.lead_count}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{badge}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <button
                            className="text-blue-600 hover:underline text-sm font-medium"
                            onClick={() => router.push(`/dashboard/batch/${batch.id}`)}
                            disabled={status !== 'completed'}
                          >
                            View Leads
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Leads</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search leads..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full md:w-64"
              />
              <label className="flex items-center gap-2 text-sm ml-2">
                <input
                  type="checkbox"
                  checked={notExportedOnly}
                  onChange={e => setNotExportedOnly(e.target.checked)}
                />
                Not yet exported
              </label>
            </div>
            <button
              className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow"
              onClick={handleExport}
              disabled={filteredLeads.length === 0}
            >
              Export{selectedLeadIds.length > 0 ? ` (${selectedLeadIds.length})` : ''}
            </button>
          </div>
          <div className="p-6">
            <LeadTable 
              leads={filteredLeads} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
              selectedLeadIds={selectedLeadIds}
              onSelectLead={handleSelectLead}
              onSelectAll={handleSelectAll}
            />
          </div>
        </div>
        <EditLeadModal
          open={editModalOpen}
          onClose={() => { setEditModalOpen(false); setSelectedLead(null); }}
          lead={selectedLead}
          onSave={handleSave}
        />
      </div>
    </RequireAuth>
  )
} 