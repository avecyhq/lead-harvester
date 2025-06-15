'use client'

import React, { useState } from 'react'
import { Lead } from '@/lib/supabase'
import { Edit, Trash2, Mail, Phone, ExternalLink } from 'lucide-react'

interface LeadTableProps {
  leads: Lead[]
  onEdit: (lead: Lead) => void
  onDelete: (id: string) => void
  selectedLeadIds?: string[]
  onSelectLead?: (leadId: string, checked: boolean) => void
  onSelectAll?: (checked: boolean) => void
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  converted: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
}

const LeadTable: React.FC<LeadTableProps> = ({ leads, onEdit, onDelete, selectedLeadIds = [], onSelectLead, onSelectAll }) => {
  const [sortColumn, setSortColumn] = useState<keyof Lead>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (column: keyof Lead) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedLeads = [...leads].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
    if (bValue == null) return sortDirection === 'asc' ? 1 : -1;
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  })

  const allSelected = leads.length > 0 && leads.every(lead => selectedLeadIds.includes(lead.id));

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No leads found. Start by uploading some leads!</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={e => onSelectAll && onSelectAll(e.target.checked)}
                aria-label="Select all leads"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('business_name')}>Business Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LinkedIn</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facebook</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instagram</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrichment</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sync</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Street</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zip</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Google Maps</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => handleSort('created_at')}>Created</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedLeads.map((lead) => (
            <tr key={lead.id} className={`hover:bg-gray-50 ${selectedLeadIds.includes(lead.id) ? 'bg-blue-50' : ''}`}>
              <td className="px-2 py-4">
                <input
                  type="checkbox"
                  checked={selectedLeadIds.includes(lead.id)}
                  onChange={e => onSelectLead && onSelectLead(lead.id, e.target.checked)}
                  aria-label={`Select lead ${lead.business_name}`}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.business_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.owner_name || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.email || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.owner_confidence !== undefined ? lead.owner_confidence : '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.email_verified === true ? '✅' : lead.email_verified === false ? '❌' : '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.owner_source || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">{lead.linkedin_url ? (<a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>) : '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">{lead.facebook_url ? (<a href={lead.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:underline">Facebook</a>) : '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">{lead.instagram_url ? (<a href={lead.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:underline">Instagram</a>) : '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.enrichment_status || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.sync_status || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.street || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.city || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.state || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.zip || '-'}</td>
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
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button onClick={() => onEdit(lead)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDelete(lead.id)} className="text-red-600 hover:text-red-900 p-1 rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default LeadTable 