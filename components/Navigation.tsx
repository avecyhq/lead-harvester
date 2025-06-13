'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Upload, Settings, Database } from 'lucide-react'

const Navigation = () => {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Database className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-gray-900">Lead Harvester</h1>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-8">
            <Link
              href="/dashboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/upload"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/upload')
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>Upload Leads</span>
            </Link>

            <Link
              href="/settings"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/settings')
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation 