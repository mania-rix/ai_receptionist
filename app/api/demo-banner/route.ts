import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[API:demo-banner] GET request (demo mode)');
  
  // Return demo banner configuration
  return NextResponse.json({
    show: true,
    message: "🚀 Demo Mode - All data is stored in session storage and will be lost on refresh or sign out",
    type: "warning",
    dismissible: true
  });
}