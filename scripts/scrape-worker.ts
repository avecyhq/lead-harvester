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

// Retry helper with exponential backoff
async function retry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
  let attempt = 0;
  let lastError;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(res => setTimeout(res, delay));
      attempt++;
    }
  }
  throw lastError;
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
          // Use built-in retry logic in fetchSerperBusinesses
          const leads = await fetchSerperBusinesses({ category, city, page, batchId, maxRetries: 3, retryDelay: 1500 });
          cityLeads.push(...leads);
        } catch (err) {
          console.error(`[JOB ${job.id}] Error scraping ${category} in ${city} page ${page}:`, err);
          // If all retries fail, mark job as failed and stop further processing
          await supabase.from('scrape_jobs').update({ status: 'failed', error: `Serper API failed for ${category} in ${city} page ${page}: ${String(err)}` }).eq('id', job.id);
          return;
        }
      }
      // Deduplicate leads by business_name + address
      const uniqueLeads = Array.from(new Map(cityLeads.map(lead => [lead.business_name + lead.address, lead])).values());
      // Retry batch insert
      try {
        await retry(async () => {
          const res = await supabase.from('batches').insert([
            {
              id: batchId,
              user_id,
              business_category: category,
              location: city,
              lead_count: uniqueLeads.length,
              created_at: new Date().toISOString(),
            },
          ]);
          if (res.error) throw res.error;
          return res;
        }, 3, 1000);
      } catch (batchError) {
        console.error(`[JOB ${job.id}] Batch insert failed:`, batchError);
        await supabase.from('scrape_jobs').update({ status: 'failed', error: `Batch insert failed for ${city}: ${String(batchError)}` }).eq('id', job.id);
        return;
      }
      // Retry leads insert
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
        try {
          await retry(async () => {
            const res = await supabase.from('leads').insert(leadsToInsert);
            if (res.error) throw res.error;
            return res;
          }, 3, 1000);
        } catch (leadError) {
          console.error(`[JOB ${job.id}] Lead insert failed:`, leadError);
          await supabase.from('scrape_jobs').update({ status: 'failed', error: `Lead insert failed for ${city}: ${String(leadError)}` }).eq('id', job.id);
          return;
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