# Firebase Firestore Setup Guide

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `optoplast-cc` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Firestore Database

1. In your Firebase project console, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development) or "Start in production mode"
4. Select a location (choose closest to your users)
5. Click "Done"

## 3. Get Firebase Configuration

1. In Firebase console, click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Enter app nickname: `optoplast-web`
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the Firebase configuration object

## 4. Update Environment Variables

Replace the placeholder values in your `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-actual-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 5. Set Up Firestore Security Rules

In Firebase console → Firestore Database → Rules, update the rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to form_submissions collection
    match /form_submissions/{document} {
      allow read, write: if true; // Change this for production security
    }
  }
}
```

**Note:** The above rules allow unrestricted access. For production, implement proper authentication and authorization.

## 6. Production Security Rules (Recommended)

For production, use more restrictive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /form_submissions/{document} {
      // Only allow authenticated users
      allow read, write: if request.auth != null;
      
      // Or allow only specific operations
      allow read: if true;
      allow create, update: if request.auth != null;
      allow delete: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## 7. Deploy Environment Variables

For production deployment, set these environment variables in your deployment platform:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 8. Test the Integration

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Navigate to the form submission page
4. Create a test submission
5. Check Firebase console → Firestore Database to see the data

## 9. Optional: Firebase Emulator (Development)

For local development without using production Firestore:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init firestore`
4. Start emulator: `firebase emulators:start --only firestore`
5. Set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` in `.env.local`

## Troubleshooting

### Common Issues:

1. **"Firebase config is invalid"**
   - Check that all environment variables are set correctly
   - Ensure no extra spaces or quotes in the values

2. **"Permission denied"**
   - Check Firestore security rules
   - Ensure the rules allow the operations you're trying to perform

3. **"Project not found"**
   - Verify the `NEXT_PUBLIC_FIREBASE_PROJECT_ID` matches your Firebase project ID

4. **Build errors**
   - Make sure all Firebase environment variables are set in your build environment
   - Check that the Firebase SDK version is compatible

### Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Next.js with Firebase](https://firebase.google.com/docs/web/setup)