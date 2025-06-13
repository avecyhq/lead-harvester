import { redirect } from 'next/navigation'
import LeadInputForm from '@/components/LeadInputForm'
import RequireAuth from '@/components/RequireAuth'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <RequireAuth>
        <LeadInputForm />
      </RequireAuth>
    </main>
  );
} 