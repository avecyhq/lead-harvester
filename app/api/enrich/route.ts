import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { enrichLead } from '@/lib/enrichment';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { leadId } = await req.json();
  if (!leadId) {
    return NextResponse.json({ message: 'Missing leadId' }, { status: 400 });
  }

  // Fetch user credits
  const { data: userCredits } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', session.user.id)
    .single();
  if (!userCredits || userCredits.balance < 1) {
    return NextResponse.json({ message: 'Insufficient credits' }, { status: 403 });
  }

  // Fetch the lead
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .eq('user_id', session.user.id)
    .single();
  if (!lead) {
    return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
  }

  // Update lead status to processing
  await supabase
    .from('leads')
    .update({ enrichment_status: 'processing' })
    .eq('id', leadId);

  try {
    // Call enrichment pipeline (stub for now)
    const enrichmentResult = await enrichLead(lead);

    // Update lead with enrichment results (stub fields)
    await supabase
      .from('leads')
      .update({
        owner_name: enrichmentResult.ownerName || null,
        owner_confidence: enrichmentResult.ownerConfidence || null,
        owner_reasoning: enrichmentResult.ownerReasoning || null,
        owner_source: enrichmentResult.source || null,
        linkedin_url: enrichmentResult.linkedinUrl || null,
        facebook_url: enrichmentResult.facebookUrl || null,
        instagram_url: enrichmentResult.instagramUrl || null,
        email: enrichmentResult.email || null,
        email_verified: enrichmentResult.emailVerified || false,
        enrichment_status: 'completed'
      })
      .eq('id', leadId);

    // Deduct 1 credit
    await supabase
      .from('user_credits')
      .update({
        balance: userCredits.balance - 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id);

    return NextResponse.json({ message: 'Lead enriched successfully', enrichmentResult });
  } catch (error: any) {
    // Update lead status to failed
    await supabase
      .from('leads')
      .update({ enrichment_status: 'failed' })
      .eq('id', leadId);
    const errorMsg = error && typeof error === 'object' && 'message' in error ? error.message : String(error);
    return NextResponse.json({ message: 'Failed to enrich lead', error: errorMsg }, { status: 500 });
  }
} 