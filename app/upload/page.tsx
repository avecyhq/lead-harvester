'use client'

import React, { useState } from 'react'
import { createLead, LeadInsert } from '@/lib/supabase'
import { Upload, Plus, FileSpreadsheet } from 'lucide-react'

export default function UploadPage() {
  const [formData, setFormData] = useState<LeadInsert>({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    status: 'new',
    source: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      await createLead(formData)
      setSuccess(true)
      setFormData({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        website: '',
        industry: '',
        status: 'new',
        source: '',
        notes: '',
      })
    } catch (error) {
      console.error('Error creating lead:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Leads</h1>
        <p className="text-gray-600 mt-2">
          Add new leads to your database manually or via bulk upload
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Manual Entry Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Plus className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Add Single Lead</h2>
          </div>

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              Lead created successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  required
                  value={formData.company_name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700">
                  Contact Name *
                </label>
                <input
                  type="text"
                  id="contact_name"
                  name="contact_name"
                  required
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Industry
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                  Source
                </label>
                <input
                  type="text"
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Lead'}
            </button>
          </form>
        </div>

        {/* Bulk Upload */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <FileSpreadsheet className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Bulk Upload</h2>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload CSV File
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your CSV file here, or click to browse
            </p>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 cursor-pointer"
            >
              Choose File
            </label>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">CSV Format Requirements:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• company_name (required)</li>
              <li>• contact_name (required)</li>
              <li>• email (required)</li>
              <li>• phone (optional)</li>
              <li>• website (optional)</li>
              <li>• industry (optional)</li>
              <li>• source (optional)</li>
              <li>• notes (optional)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 