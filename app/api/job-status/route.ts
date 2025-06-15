import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get('jobId');
  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  }
  const supabase = createRouteHandlerClient({ cookies });
  const { data: job, error } = await supabase
    .from('scrape_jobs')
    .select('status, error, result')
    .eq('id', jobId)
    .single();
  if (error || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  return NextResponse.json({ status: job.status, error: job.error, result: job.result });
} 