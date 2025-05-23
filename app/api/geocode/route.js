// app/api/geocode/route.js (New File)
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ message: 'Address parameter is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Google Maps API Key is not configured.");
    return NextResponse.json({ message: 'Geocoding service not configured' }, { status: 500 });
  }

  const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const geoResponse = await fetch(geocodingUrl);
    const geoData = await geoResponse.json();

    if (geoData.status === 'OK' && geoData.results && geoData.results.length > 0) {
      const location = geoData.results[0].geometry.location; // { lat, lng }
      return NextResponse.json(location, { status: 200 });
    } else {
      console.warn(`Geocoding API error for address "${address}": ${geoData.status} - ${geoData.error_message || ''}`);
      return NextResponse.json({ message: `Geocoding failed: ${geoData.status}`, details: geoData.error_message }, { status: geoData.status === 'ZERO_RESULTS' ? 404 : 500 });
    }
  } catch (error) {
    console.error('Geocoding fetch error:', error);
    return NextResponse.json({ message: 'Error during geocoding request', error: error.message }, { status: 500 });
  }
}
