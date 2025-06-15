import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Parser } from 'json2csv';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await req.json();
    const { selectedLeadIds, search, notExportedOnly } = body;

    // Build query
    let query = supabase.from('leads').select('*').eq('user_id', userId);
    if (selectedLeadIds && selectedLeadIds.length > 0) {
      query = query.in('id', selectedLeadIds);
    }
    if (search && search.trim() !== '') {
      // Example: search business_name, category, city, phone
      query = query.or(`business_name.ilike.%${search}%,category.ilike.%${search}%,city.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    if (notExportedOnly) {
      query = query.is('exported_at', null);
    }
    const { data: leads, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to fetch leads', details: error }, { status: 500 });
    }
    if (!leads || leads.length === 0) {
      return NextResponse.json({ success: false, error: 'No leads found for export' }, { status: 404 });
    }

    // Remove internal IDs from export
    const exportFields = [
      'business_name', 'street', 'city', 'state', 'zip', 'phone', 'category', 'average_rating', 'number_of_reviews', 'website', 'google_maps_url', 'created_at'
    ];
    const parser = new Parser({ fields: exportFields });
    const csv = parser.parse(leads);

    // Mark exported leads (after generating CSV)
    const leadIds = leads.map((lead: any) => lead.id);
    await supabase.from('leads').update({ exported_at: new Date().toISOString() }).in('id', leadIds);

    // Return CSV as file download
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const filename = `leads_harvester_export_${timestamp}.csv`;
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('Export leads error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error', details: String(err) }, { status: 500 });
  }
} 