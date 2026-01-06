# Google Single Sign-On Authentication Setup Guide

## 1. Google OAuth Setup
o2L9WfR+5JzS8N1mK6xVqY3gH4pZ2b7uE9iD0A8nL4M=
### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://demo.emmanuelshekinah.co.za/api/auth/callback/google`
   - Save and copy the Client ID and Client Secret

### Step 2: Update Environment Variables

Replace the placeholder values in your `.env.local` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-nextauth-key
NEXTAUTH_URL=http://localhost:3000  # For development
```

For production, set these in your deployment platform:
```env
NEXTAUTH_URL=https://demo.emmanuelshekinah.co.za
NEXTAUTH_SECRET=your-production-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 2. NextAuth Secret Generation

Generate a secure NextAuth secret:

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 3. Firebase Security Rules Update

Update your Firestore security rules to require authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /form_submissions/{document} {
      // Only allow authenticated users
      allow read, write: if request.auth != null;
      
      // Optional: Add user-specific access
      // allow read, write: if request.auth != null && request.auth.token.email_verified == true;
    }
  }
}
```

## 4. Testing Authentication

### Development Testing:
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Navigate to `http://localhost:3000`
4. You should be redirected to the sign-in page
5. Click "Sign in with Google"
6. Complete Google OAuth flow
7. You should be redirected to the dashboard

### Production Testing:
1. Deploy with proper environment variables
2. Test the OAuth flow on your production domain
3. Verify that users can sign in and access the form submission page

## 5. Authentication Flow

1. **Unauthenticated users** → Redirected to `/auth/signin`
2. **Sign in with Google** → OAuth flow with Google
3. **Successful authentication** → Redirected to `/dashboard/form-submission`
4. **Protected routes** → Middleware checks authentication
5. **Sign out** → Clears session and redirects to sign-in

## 6. Protected Routes

The following routes are protected by authentication:
- `/dashboard/*` - All dashboard pages
- `/api/protected/*` - Protected API routes (if added)

## 7. User Session Management

- **Session data includes:**
  - User ID
  - Name
  - Email
  - Profile image
  - Authentication status

- **Session persistence:**
  - JWT tokens stored securely
  - Automatic session refresh
  - Secure cookie handling

## 8. Security Features

- **CSRF Protection** - Built into NextAuth.js
- **Secure Cookies** - HTTPOnly, Secure, SameSite
- **JWT Tokens** - Signed and encrypted
- **Route Protection** - Middleware-based authentication
- **Session Validation** - Automatic token verification

## 9. Troubleshooting

### Common Issues:

1. **"Configuration error"**
   - Check that `NEXTAUTH_SECRET` is set
   - Verify Google OAuth credentials are correct
   - Ensure redirect URIs match exactly

2. **"Access denied"**
   - Check Google OAuth consent screen settings
   - Verify the user's email domain is allowed (if restricted)

3. **"Callback URL mismatch"**
   - Ensure redirect URIs in Google Console match your domain
   - Check for HTTP vs HTTPS mismatches

4. **"Session not found"**
   - Clear browser cookies and try again
   - Check that `NEXTAUTH_URL` matches your domain

### Debug Mode:

Add to your `.env.local` for debugging:
```env
NEXTAUTH_DEBUG=true
```

## 10. Production Deployment

### Environment Variables Required:
- `NEXTAUTH_URL` - Your production domain
- `NEXTAUTH_SECRET` - Secure random string
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret

### Security Checklist:
- [ ] Use HTTPS in production
- [ ] Set secure `NEXTAUTH_SECRET`
- [ ] Configure proper redirect URIs
- [ ] Update Firestore security rules
- [ ] Test authentication flow
- [ ] Verify session management

## 11. Optional Enhancements

### Email Domain Restrictions:
```javascript
// In [...nextauth]/route.ts
callbacks: {
  async signIn({ user, account, profile }) {
    // Only allow specific email domains
    if (user.email?.endsWith('@yourcompany.com')) {
      return true;
    }
    return false;
  },
}
```

### Role-Based Access:
```javascript
// Add roles to session
callbacks: {
  async session({ session, token }) {
    session.user.role = 'admin'; // Set based on email or database
    return session;
  },
}
```

## Support Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Firebase Authentication](https://firebase.google.com/docs/auth)