import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to your GeoJSON file
    const filePath = path.join(process.cwd(), 'public', 'data', 'locations.geojson');
    
    // Read the file
    const fileData = fs.readFileSync(filePath, 'utf8');
    const geoJson = JSON.parse(fileData);
    
    return NextResponse.json(geoJson);
  } catch (error) {
    console.error('Error reading GeoJSON file:', error);
    return NextResponse.json(
      { error: 'Failed to load GeoJSON data' },
      { status: 500 }
    );
  }
}