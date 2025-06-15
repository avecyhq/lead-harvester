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
  latitude: number | null;
  longitude: number | null;
}

export async function fetchSerperBusinesses({ category, city, page, batchId, maxRetries = 3, retryDelay = 1000 }: { category: string; city: string; page: number; batchId: string; maxRetries?: number; retryDelay?: number; }): Promise<SerperBusinessResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) throw new Error('SERPER_API_KEY not set');
  let query = `${category} in ${city}`;
  if (page > 1) query += ` page ${page}`;

  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
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
      return data.places.map((place: any) => ({
        business_name: place.title,
        address: place.address,
        phone: place.phoneNumber || '',
        website: place.website || '',
        category: place.type || (place.types && place.types[0]) || '',
        average_rating: place.rating ?? null,
        number_of_reviews: place.ratingCount ?? null,
        google_maps_url: place.placeId ? `https://www.google.com/maps/place/?q=place_id=${place.placeId}` : '',
        city,
        page,
        query_source: query,
        batch_id: batchId,
        latitude: place.latitude,
        longitude: place.longitude,
      }));
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise(res => setTimeout(res, retryDelay));
      } else {
        // All retries failed
        throw lastError;
      }
    }
  }
  // Should never reach here, but throw just in case
  throw lastError || new Error('Unknown error in fetchSerperBusinesses');
} 