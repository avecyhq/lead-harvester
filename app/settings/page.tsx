'use client'

import React, { useState } from 'react'
import { Settings, Database, Key, Bell, User } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      browser: false,
      sms: false,
    },
    database: {
      autoBackup: true,
      retentionDays: 30,
    },
    scraping: {
      concurrent: 5,
      delay: 1000,
      timeout: 30000,
    },
  })

  const handleNotificationChange = (type: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value,
      },
    }))
  }

  const handleDatabaseChange = (field: string, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      database: {
        ...prev.database,
        [field]: value,
      },
    }))
  }

  const handleScrapingChange = (field: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      scraping: {
        ...prev.scraping,
        [field]: value,
      },
    }))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure your lead harvester application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Database Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Database className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Database Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Auto Backup</h3>
                <p className="text-sm text-gray-600">Automatically backup your data daily</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.database.autoBackup}
                  onChange={(e) => handleDatabaseChange('autoBackup', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div>
              <label htmlFor="retention" className="block text-sm font-medium text-gray-700">
                Data Retention (days)
              </label>
              <input
                type="number"
                id="retention"
                value={settings.database.retentionDays}
                onChange={(e) => handleDatabaseChange('retentionDays', parseInt(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Bell className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600">Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => handleNotificationChange('email', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Browser Notifications</h3>
                <p className="text-sm text-gray-600">Show notifications in your browser</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.browser}
                  onChange={(e) => handleNotificationChange('browser', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
                <p className="text-sm text-gray-600">Get text message alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.sms}
                  onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Scraping Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Settings className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Scraping Configuration</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="concurrent" className="block text-sm font-medium text-gray-700">
                Concurrent Requests
              </label>
              <input
                type="number"
                id="concurrent"
                min="1"
                max="10"
                value={settings.scraping.concurrent}
                onChange={(e) => handleScrapingChange('concurrent', parseInt(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
              <p className="text-xs text-gray-500 mt-1">Number of simultaneous scraping requests</p>
            </div>

            <div>
              <label htmlFor="delay" className="block text-sm font-medium text-gray-700">
                Request Delay (ms)
              </label>
              <input
                type="number"
                id="delay"
                min="100"
                max="5000"
                value={settings.scraping.delay}
                onChange={(e) => handleScrapingChange('delay', parseInt(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
              <p className="text-xs text-gray-500 mt-1">Delay between requests to avoid rate limiting</p>
            </div>

            <div>
              <label htmlFor="timeout" className="block text-sm font-medium text-gray-700">
                Request Timeout (ms)
              </label>
              <input
                type="number"
                id="timeout"
                min="5000"
                max="60000"
                value={settings.scraping.timeout}
                onChange={(e) => handleScrapingChange('timeout', parseInt(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum time to wait for a response</p>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Key className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">API Configuration</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="supabase_url" className="block text-sm font-medium text-gray-700">
                Supabase URL
              </label>
              <input
                type="url"
                id="supabase_url"
                placeholder="https://your-project.supabase.co"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="supabase_key" className="block text-sm font-medium text-gray-700">
                Supabase Anon Key
              </label>
              <input
                type="password"
                id="supabase_key"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> API keys should be set in your environment variables (.env.local) for security.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          Save Settings
        </button>
      </div>
    </div>
  )
} 