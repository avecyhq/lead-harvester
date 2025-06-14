import { v4 as uuidv4 } from 'uuid';

export interface SerperBusinessResult {
  business_name: string;
  address: string;
  phone: string;
  website: string;
  category: string;
  average_rating: number | null;
  number_of_reviews: number | null;
  google_maps_url: string;
  city: string;
  page: number;
  query_source: string;
  batch_id: string;
}

export async function fetchSerperBusinesses({ category, city, page, batchId }: { category: string; city: string; page: number; batchId: string; }): Promise<SerperBusinessResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) throw new Error('SERPER_API_KEY not set');
  let query = `${category} in ${city}`;
  if (page > 1) query += ` page ${page}`;
  const response = await fetch('https://google.serper.dev/maps', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, limit: 10 }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Serper.dev error: ${errorText}`);
  }
  const data = await response.json();
  if (!data.places || !Array.isArray(data.places)) return [];
  return data.places.map((place: any) => ({
    business_name: place.title,
    address: place.address,
    phone: place.phone || '',
    website: place.website || '',
    category: place.type || '',
    average_rating: place.rating ?? null,
    number_of_reviews: place.reviewsCount ?? null,
    google_maps_url: place.link,
    city,
    page,
    query_source: query,
    batch_id: batchId,
  }));
} 