console.log('🧪 TEST API ROUTE LOADED FROM', __filename)
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ success: true, message: 'Test route is working' })
} 