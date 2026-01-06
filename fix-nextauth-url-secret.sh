#!/bin/bash

echo "🔧 Fixing NEXTAUTH_URL secret"
echo "============================="

# Use the correct project
firebase use optoplast-50935

# Set the correct NEXTAUTH_URL
CORRECT_URL="https://optoplast-cc--optoplast-50935.us-east4.hosted.app"

echo "Setting NEXTAUTH_URL to: $CORRECT_URL"
echo $CORRECT_URL | firebase apphosting:secrets:set NEXTAUTH_URL

echo ""
echo "✅ NEXTAUTH_URL updated!"
echo ""
echo "🔍 Debug your NextAuth configuration at:"
echo "$CORRECT_URL/api/debug/nextauth"
echo ""
echo "📋 Make sure your Google OAuth redirect URI is exactly:"
echo "$CORRECT_URL/api/auth/callback/google"