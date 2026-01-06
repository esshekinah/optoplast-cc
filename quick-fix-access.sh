#!/bin/bash

echo "🚀 Quick Fix: Granting App Hosting access to existing secrets"
echo "============================================================"

# Use the correct project
firebase use optoplast-50935

echo "🔑 Granting access to all required secrets..."
echo ""

# Grant access to all secrets
firebase apphosting:secrets:grantaccess NEXTAUTH_SECRET
firebase apphosting:secrets:grantaccess NEXTAUTH_URL
firebase apphosting:secrets:grantaccess GOOGLE_CLIENT_ID
firebase apphosting:secrets:grantaccess GOOGLE_CLIENT_SECRET

echo ""
echo "✅ Access granted to all secrets!"
echo ""
echo "⏳ Please wait 2-3 minutes for changes to propagate, then your app should deploy successfully."
echo ""
echo "🔍 You can monitor the deployment in Firebase Console:"
echo "https://console.firebase.google.com/project/optoplast-50935/apphosting"