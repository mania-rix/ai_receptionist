import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[API:demo-banner] GET request');
  
  // Return demo banner configuration
  return NextResponse.json({
    show: true,
    message: "🚀 Demo Mode - BlvckWall AI Hackathon MVP",
    type: "info",
    dismissible: true
  });
}