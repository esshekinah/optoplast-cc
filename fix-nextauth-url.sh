#!/bin/bash

echo "🔧 Fixing NEXTAUTH_URL for Firebase App Hosting"
echo "==============================================="

# Set the correct NEXTAUTH_URL for your Firebase App Hosting deployment
CORRECT_URL="https://optoplast-cc--optoplast-50935.us-east4.hosted.app"

echo "Setting NEXTAUTH_URL to: $CORRECT_URL"
echo $CORRECT_URL | firebase apphosting:secrets:set NEXTAUTH_URL

echo ""
echo "✅ NEXTAUTH_URL updated!"
echo ""
echo "📋 Next steps:"
echo "1. Update Google OAuth redirect URI to:"
echo "   $CORRECT_URL/api/auth/callback/google"
echo ""
echo "2. Redeploy your app or wait for automatic deployment"
echo ""
echo "3. Test authentication at:"
echo "   $CORRECT_URL"