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

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useSupabaseClient()
  const router = useRouter()

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
        // Debug output
        if ((leadsData?.length ?? 0) === 0) {
          console.log('DEBUG: No leads found', leadsData)
        }
        if ((batchesData?.length ?? 0) === 0) {
          console.log('DEBUG: No batches found', batchesData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [supabase])

  const handleEdit = (lead: Lead) => {
    // TODO: Implement edit functionality
    console.log('Edit lead:', lead)
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
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {batches.map((batch) => (
                    <tr key={batch.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{batch.business_category}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{batch.location}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{new Date(batch.created_at).toLocaleString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{batch.lead_count}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <button
                          className="text-blue-600 hover:underline text-sm font-medium"
                          onClick={() => router.push(`/dashboard/batch/${batch.id}`)}
                        >
                          View Leads
                        </button>
                      </td>
                    </tr>
                  ))}
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
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
          </div>
          <div className="p-6">
            <LeadTable 
              leads={leads} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          </div>
        </div>
      </div>
    </RequireAuth>
  )
} 