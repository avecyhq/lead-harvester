import { createClient } from '@supabase/supabase-js';
import { fetchSerperBusinesses } from '../lib/serper';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for full access
);

function extractCity(address: string): string {
  const parts = address.split(',');
  return parts.length >= 2 ? parts[parts.length - 2].trim() : '';
}
function extractState(address: string): string {
  const parts = address.split(',');
  if (parts.length >= 2) {
    const stateZip = parts[parts.length - 1].trim();
    const state = stateZip.split(' ')[0];
    return state;
  }
  return '';
}
function extractZip(address: string): string {
  const parts = address.split(',');
  if (parts.length >= 2) {
    const stateZip = parts[parts.length - 1].trim();
    const zip = stateZip.split(' ')[1];
    return zip || '';
  }
  return '';
}
function extractStreet(address: string): string {
  const parts = address.split(',');
  return parts.length >= 1 ? parts[0].trim() : '';
}

async function processJob(job: any) {
  console.log(`[JOB] Processing job ${job.id} for user ${job.user_id}`);
  try {
    // Mark job as processing
    await supabase.from('scrape_jobs').update({ status: 'processing' }).eq('id', job.id);
    const { category, cities, pages, user_id } = job;
    let allBatches: any[] = [];
    let allLeads: any[] = [];
    for (const city of cities) {
      const batchId = uuidv4();
      let cityLeads: any[] = [];
      for (const page of pages) {
        try {
          const leads = await fetchSerperBusinesses({ category, city, page, batchId });
          cityLeads.push(...leads);
        } catch (err) {
          console.error(`[JOB ${job.id}] Error scraping ${category} in ${city} page ${page}:`, err);
        }
      }
      // Deduplicate leads by business_name + address
      const uniqueLeads = Array.from(new Map(cityLeads.map(lead => [lead.business_name + lead.address, lead])).values());
      // Insert batch
      const { error: batchError } = await supabase.from('batches').insert([
        {
          id: batchId,
          user_id,
          business_category: category,
          location: city,
          lead_count: uniqueLeads.length,
          created_at: new Date().toISOString(),
        },
      ]);
      if (batchError) {
        console.error(`[JOB ${job.id}] Batch insert failed:`, batchError);
        continue;
      }
      // Insert leads
      const leadsToInsert = uniqueLeads.map(lead => ({
        ...lead,
        street: lead.address ? extractStreet(lead.address) : '',
        city: lead.address ? extractCity(lead.address) : '',
        state: lead.address ? extractState(lead.address) : '',
        zip: lead.address ? extractZip(lead.address) : '',
        batch_id: batchId,
        user_id,
        created_at: new Date().toISOString(),
      }));
      if (leadsToInsert.length > 0) {
        const { error: leadError } = await supabase.from('leads').insert(leadsToInsert);
        if (leadError) {
          console.error(`[JOB ${job.id}] Lead insert failed:`, leadError);
        }
      }
      allBatches.push(batchId);
      allLeads.push(...leadsToInsert);
    }
    // Mark job as completed
    await supabase.from('scrape_jobs').update({ status: 'completed', result: { batches: allBatches, leads: allLeads.length } }).eq('id', job.id);
    console.log(`[JOB] Completed job ${job.id}: ${allLeads.length} leads, ${allBatches.length} batches.`);
  } catch (err: any) {
    console.error(`[JOB] Failed job ${job.id}:`, err);
    await supabase.from('scrape_jobs').update({ status: 'failed', error: err.message || String(err) }).eq('id', job.id);
  }
}

async function pollJobs() {
  while (true) {
    // Get the next pending job
    const { data: jobs, error } = await supabase.from('scrape_jobs').select('*').eq('status', 'pending').order('created_at', { ascending: true }).limit(1);
    if (error) {
      console.error('[WORKER] Error fetching jobs:', error);
      await new Promise(res => setTimeout(res, 5000));
      continue;
    }
    if (jobs && jobs.length > 0) {
      await processJob(jobs[0]);
    } else {
      // No jobs, wait before polling again
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

pollJobs().catch(err => {
  console.error('[WORKER] Fatal error:', err);
  process.exit(1);
}); 