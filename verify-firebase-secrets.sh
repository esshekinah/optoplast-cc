#!/bin/bash

echo "🔍 Firebase App Hosting Secrets Verification"
echo "============================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run: firebase login"
    exit 1
fi

# Get current project
PROJECT=$(firebase use --json 2>/dev/null | jq -r '.result.current // empty')
if [ -z "$PROJECT" ]; then
    echo "❌ No Firebase project selected. Please run: firebase use <project-id>"
    exit 1
fi

echo "📁 Current project: $PROJECT"
echo ""

# List all secrets
echo "🔐 Checking Firebase App Hosting secrets..."
firebase apphosting:secrets:list 2>/dev/null || {
    echo "❌ Failed to list secrets. Make sure App Hosting is enabled for this project."
    exit 1
}

echo ""
echo "✅ Required secrets for authentication:"
echo "- GOOGLE_CLIENT_ID"
echo "- GOOGLE_CLIENT_SECRET" 
echo "- NEXTAUTH_SECRET"
echo "- NEXTAUTH_URL"

echo ""
echo "🌐 Your app URL should be:"
echo "https://optoplast-cc--$PROJECT.us-east4.hosted.app"

echo ""
echo "📋 Google OAuth redirect URI should be:"
echo "https://optoplast-cc--$PROJECT.us-east4.hosted.app/api/auth/callback/google"

echo ""
echo "🔧 To set missing secrets, run:"
echo "firebase apphosting:secrets:set SECRET_NAME"

echo ""
echo "🐛 To debug environment variables, visit:"
echo "https://optoplast-cc--$PROJECT.us-east4.hosted.app/api/debug/env"