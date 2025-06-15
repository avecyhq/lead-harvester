import { NextResponse } from 'next/server';
import { fetchSerperBusinesses } from '@/lib/serper';
import { v4 as uuidv4 } from 'uuid';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Utility functions for extracting city/state will be added later

function extractCity(address: string): string {
  // Simple extraction: assumes format 'Street, City, State Zip'
  const parts = address.split(',');
  return parts.length >= 2 ? parts[parts.length - 2].trim() : '';
}

function extractState(address: string): string {
  // Simple extraction: assumes format 'Street, City, State Zip'
  const parts = address.split(',');
  if (parts.length >= 2) {
    const stateZip = parts[parts.length - 1].trim();
    const state = stateZip.split(' ')[0];
    return state;
  }
  return '';
}

function extractZip(address: string): string {
  // Simple extraction: assumes format 'Street, City, State Zip'
  const parts = address.split(',');
  if (parts.length >= 2) {
    const stateZip = parts[parts.length - 1].trim();
    const zip = stateZip.split(' ')[1];
    return zip || '';
  }
  return '';
}

function extractUnit(address: string): string {
  // Looks for unit/apt/suite in the first part of the address
  // e.g., '123 Main St Apt 4B, City, State Zip'
  const firstPart = address.split(',')[0];
  const match = firstPart.match(/(Apt|Suite|Unit|#)\s*([\w-]+)/i);
  return match ? match[0] : '';
}

function extractStreet(address: string): string {
  // Assumes format 'Street, City, State Zip'
  const parts = address.split(',');
  return parts.length >= 1 ? parts[0].trim() : '';
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Ensure user exists in users table
    await supabase.from('users').upsert([
      {
        id: userId,
        email: session.user.email, // add other fields as needed
      }
    ]);

    const body = await req.json();
    const { category, cities, pages } = body;
    if (!category || !cities || !pages) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Enqueue a new scrape job
    const { data: job, error: jobError } = await supabase.from('scrape_jobs').insert([
      {
        user_id: userId,
        category,
        cities,
        pages,
        status: 'pending',
      }
    ]).select().single();

    if (jobError) {
      console.error('Failed to enqueue scrape job:', jobError);
      return NextResponse.json({ success: false, error: 'Failed to enqueue scrape job', details: jobError }, { status: 500 });
    }

    // Insert a pending batch row for each city
    const now = new Date().toISOString();
    const batchRows = cities.map((city: string) => ({
      user_id: userId,
      business_category: category,
      location: city,
      lead_count: 0,
      created_at: now,
    }));
    const { error: batchInsertError } = await supabase.from('batches').insert(batchRows);
    if (batchInsertError) {
      console.error('Failed to insert pending batches:', batchInsertError);
      // Don't fail the request, just log
    }

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (err) {
    console.error('API /api/scrape error:', err);
    const errorMsg = (err && typeof err === 'object' && 'message' in err) ? (err as any).message : String(err);
    return NextResponse.json({ success: false, error: 'Internal server error', details: errorMsg }, { status: 500 });
  }
} 