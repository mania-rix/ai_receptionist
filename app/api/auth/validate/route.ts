import { NextResponse } from 'next/server';
import { validateEmail, validatePassword } from '@/lib/auth-utils';

/**
 * API route to validate credentials
 * POST: Validates email and password format
 */

export async function POST(req: Request) {
  console.log('[API:auth/validate] POST request');
  try {
    const { email, password } = await req.json();
    
    const errors = [];
    
    // Validate email
    if (!email) {
      errors.push('Email is required');
    } else if (!validateEmail(email)) {
      errors.push('Invalid email format');
    }
    
    // Validate password
    if (!password) {
      errors.push('Password is required');
    } else if (!validatePassword(password)) {
      errors.push('Password must be at least 8 characters with 1 uppercase letter and 1 number');
    }
    
    return NextResponse.json({
      valid: errors.length === 0,
      errors
    });
  } catch (error) {
    console.error('[API:auth/validate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to validate credentials' },
      { status: 500 }
    );
  }
}