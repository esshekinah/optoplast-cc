import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL;// || 'http://localhost:3000';
  
  const debugInfo = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    expectedCallbackUrl: `${baseUrl}/api/auth/callback/google`,
    currentHost: process.env.VERCEL_URL || process.env.HOST || 'unknown',
    allEnvVars: {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Not set',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
    }
  };

  return NextResponse.json(debugInfo, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  });
}