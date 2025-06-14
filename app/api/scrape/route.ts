import { NextResponse } from 'next/server';
import { fetchSerperBusinesses } from '@/lib/serper';
import { v4 as uuidv4 } from 'uuid';

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

export async function POST(request: Request) {
  try {
    const { category, cities, pages } = await request.json();
    if (!category || !Array.isArray(cities) || !Array.isArray(pages) || cities.length === 0 || pages.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing or invalid category, cities, or pages.' }, { status: 400 });
    }
    if (cities.length > 25) {
      return NextResponse.json({ success: false, error: 'You can enter up to 25 cities per search.' }, { status: 400 });
    }
    const batchId = uuidv4();
    const allResults = await Promise.all(
      cities.flatMap(city =>
        pages.map(page =>
          fetchSerperBusinesses({ category, city, page, batchId })
        )
      )
    );
    // Flatten the array of arrays
    const combined = allResults.flat();
    return NextResponse.json({ success: true, batch_id: batchId, results: combined });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Internal server error.' }, { status: 500 });
  }
} 