#!/bin/bash

echo "🔐 Granting App Hosting access to secrets"
echo "========================================"
#
# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run: firebase login"
    exit 1
fi

# Use the correct project
firebase use optoplast-50935

echo "📁 Using project: optoplast-50935"
echo ""

# List of secrets that need access
SECRETS=(
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL" 
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
)

echo "🔑 Granting access to secrets..."
echo ""

for secret in "${SECRETS[@]}"; do
    echo "Granting access to: $secret"
    firebase apphosting:secrets:grantaccess $secret
    if [ $? -eq 0 ]; then
        echo "✅ Access granted to $secret"
    else
        echo "❌ Failed to grant access to $secret"
    fi
    echo ""
done

echo "🎉 Completed granting access to all secrets!"
echo ""
echo "📋 Next steps:"
echo "1. Wait a few minutes for the changes to propagate"
echo "2. Redeploy your app or wait for automatic deployment"
echo "3. Test your authentication"
echo ""
echo "🔍 To verify secrets are accessible, check:"
echo "https://optoplast-cc--optoplast-50935.us-east4.hosted.app/api/debug/env"