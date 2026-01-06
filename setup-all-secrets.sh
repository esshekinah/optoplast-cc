#!/bin/bash

echo "🔐 Setting up all Firebase App Hosting secrets"
echo "=============================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase..."
    firebase login
fi

# Use the correct project
firebase use optoplast-50935

echo ""
echo "🎯 Setting up secrets for optoplast-50935"
echo ""

# Set NEXTAUTH_URL (this should be your Firebase App Hosting URL)
echo "Setting NEXTAUTH_URL..."
echo "https://optoplast-cc--optoplast-50935.us-east4.hosted.app" | firebase apphosting:secrets:set NEXTAUTH_URL

# Generate and set NEXTAUTH_SECRET
echo ""
echo "🎲 Generating NextAuth secret..."
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
echo "Generated: $NEXTAUTH_SECRET"
echo $NEXTAUTH_SECRET | firebase apphosting:secrets:set NEXTAUTH_SECRET

echo ""
echo "📝 Now you need to set your Google OAuth credentials:"
echo ""
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Create OAuth 2.0 Client ID (Web application)"
echo "3. Add redirect URI: https://optoplast-cc--optoplast-50935.us-east4.hosted.app/api/auth/callback/google"
echo "4. Copy the Client ID and Client Secret"
echo ""

read -p "🔑 Enter your Google Client ID: " GOOGLE_CLIENT_ID
read -p "🔐 Enter your Google Client Secret: " GOOGLE_CLIENT_SECRET

echo ""
echo "Setting Google OAuth secrets..."
echo $GOOGLE_CLIENT_ID | firebase apphosting:secrets:set GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET | firebase apphosting:secrets:set GOOGLE_CLIENT_SECRET

echo ""
echo "🔑 Granting App Hosting access to all secrets..."
echo ""

# Grant access to all secrets
SECRETS=("NEXTAUTH_SECRET" "NEXTAUTH_URL" "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET")

for secret in "${SECRETS[@]}"; do
    echo "Granting access to: $secret"
    firebase apphosting:secrets:grantaccess $secret
    if [ $? -eq 0 ]; then
        echo "✅ Access granted to $secret"
    else
        echo "⚠️  Failed to grant access to $secret (it might already have access)"
    fi
done

echo ""
echo "✅ All secrets set and access granted! Verifying..."
firebase apphosting:secrets:list

echo ""
echo "🎉 Setup completed!"
echo ""
echo "📋 Summary of secrets set:"
echo "- NEXTAUTH_URL: https://optoplast-cc--optoplast-50935.us-east4.hosted.app"
echo "- NEXTAUTH_SECRET: ✅ Generated and set"
echo "- GOOGLE_CLIENT_ID: ✅ Set"
echo "- GOOGLE_CLIENT_SECRET: ✅ Set"
echo ""
echo "🚀 Your app should now build and deploy successfully!"
echo ""
echo "📖 Next steps:"
echo "1. Wait 2-3 minutes for changes to propagate"
echo "2. Commit and push your changes (apphosting.yaml updated)"
echo "3. Firebase will automatically redeploy"
echo "4. Test authentication at your app URL"