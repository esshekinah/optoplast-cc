import { NextResponse } from 'next/server';

export async function GET() {
  // Only show this in development or with a debug key
  const isDev = process.env.NODE_ENV === 'development';
  const debugKey = process.env.DEBUG_KEY;
  
  if (!isDev && !debugKey) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
    // Show partial values for debugging (first 4 chars + ...)
    NEXTAUTH_URL_VALUE: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL.substring(0, 20)}...` : 'Not set',
    GOOGLE_CLIENT_ID_VALUE: process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...` : 'Not set',
  };

  return NextResponse.json(envCheck);
}