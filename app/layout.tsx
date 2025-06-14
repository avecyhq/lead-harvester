import React from 'react'
import './globals.css'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'
import SupabaseProvider from '@/components/SupabaseProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Lead Harvester',
  description: 'A powerful lead scraping and management application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  )
} 