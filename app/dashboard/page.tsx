'use client'

import React, { useState, useEffect } from 'react'
import { Lead, getLeads, deleteLead } from '@/lib/supabase'
import LeadTable from '@/components/LeadTable'
import { BarChart3, Users, TrendingUp, Target } from 'lucide-react'

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await getLeads()
        setLeads(data)
      } catch (error) {
        console.error('Error fetching leads:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [])

  const handleEdit = (lead: Lead) => {
    // TODO: Implement edit functionality
    console.log('Edit lead:', lead)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteLead(id)
      setLeads(leads.filter(lead => lead.id !== id))
    } catch (error) {
      console.error('Error deleting lead:', error)
    }
  }

  const stats = {
    total: leads.length,
    new: leads.filter(lead => lead.status === 'new').length,
    contacted: leads.filter(lead => lead.status === 'contacted').length,
    qualified: leads.filter(lead => lead.status === 'qualified').length,
    converted: leads.filter(lead => lead.status === 'converted').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of your lead generation and management activities
        </p>
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

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{stats.new}</p>
              <p className="text-sm text-gray-600">New Leads</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{stats.contacted}</p>
              <p className="text-sm text-gray-600">Contacted</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{stats.qualified}</p>
              <p className="text-sm text-gray-600">Qualified</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{stats.converted}</p>
              <p className="text-sm text-gray-600">Converted</p>
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
  )
} 