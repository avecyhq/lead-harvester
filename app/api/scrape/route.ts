console.log('🔥 API ROUTE LOADED FROM', __filename);
console.log('🔥 API ROUTE IS LIVE: ' + new Date().toISOString());
console.log('DEBUG: API ROUTE VERSION 1.0.0');
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

export async function POST(req: Request) {
  console.log('DEBUG: Entered API route');
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    console.log('DEBUG: session', session);
    if (!session) {
      console.log('DEBUG: No session, unauthorized');
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
    console.log('DEBUG: request body', body);
    const { category, cities, pages } = body;
    if (!category || !cities || !pages) {
      console.log('DEBUG: Missing required fields');
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    // For each city, generate a batchId, scrape, and insert
    for (const city of cities) {
      const batchId = uuidv4();
      let allLeads: any[] = [];
      for (const page of pages) {
        console.log('DEBUG: About to call fetchSerperBusinesses', { category, city, page, batchId });
        try {
          const leads = await fetchSerperBusinesses({ category, city, page, batchId });
          console.log('DEBUG: fetchSerperBusinesses returned', { count: leads.length });
          allLeads.push(...leads);
        } catch (fetchErr) {
          console.log('DEBUG: fetchSerperBusinesses threw', fetchErr);
          throw fetchErr;
        }
      }
      // Deduplicate leads by business_name + address
      const uniqueLeads = Array.from(new Map(allLeads.map(lead => [lead.business_name + lead.address, lead])).values());
      console.log('DEBUG: About to insert batch for city', city);
      const { data: batchData, error: batchError } = await supabase.from('batches').insert([
        {
          id: batchId,
          user_id: userId,
          business_category: category,
          location: city,
          lead_count: uniqueLeads.length,
          created_at: new Date().toISOString(),
        },
      ]).select();
      console.log('DEBUG: Insert batch', { city, batchData, batchError });
      if (batchError) {
        console.log('DEBUG: Batch insert failed', batchError);
        return NextResponse.json({ success: false, error: 'Batch insert failed', details: batchError }, { status: 500 });
      }
      // Insert leads for this batch
      const leadsToInsert = uniqueLeads.map(lead => ({
        ...lead,
        batch_id: batchId,
        user_id: userId,
        created_at: new Date().toISOString(),
      }));
      console.log('DEBUG: Prepared to insert leads for batch', { batchId, leadsToInsertCount: leadsToInsert.length });
      if (leadsToInsert.length > 0) {
        const { data: leadData, error: leadError } = await supabase.from('leads').insert(leadsToInsert).select();
        console.log('DEBUG: Insert leads result', { batchId, insertedCount: leadData ? leadData.length : 0, leadError });
        if (leadError) {
          console.log('DEBUG: Lead insert failed', leadError);
          return NextResponse.json({ success: false, error: 'Lead insert failed', details: leadError }, { status: 500 });
        }
        if (!leadData || leadData.length === 0) {
          console.log('DEBUG: No leads were inserted for batch', batchId);
        }
      } else {
        console.log('DEBUG: No leads to insert for batch', batchId);
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.log('DEBUG: Caught error in API route', err);
    const errorMsg = (err && typeof err === 'object' && 'message' in err) ? (err as any).message : String(err);
    return NextResponse.json({ success: false, error: 'Internal server error', details: errorMsg }, { status: 500 });
  }
} 