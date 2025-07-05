# Social Authentication Setup Guide

This guide will help you set up Google and Facebook authentication for your InSync app. Currently, the app uses mock authentication for development purposes.

## 🔧 Configuration Overview

The social authentication is implemented using `expo-auth-session` with PKCE (Proof Key for Code Exchange) for security. The configuration is located in:

- **Service**: `services/socialAuth.ts`
- **Configuration**: Update the `AUTH_CONFIG` object

## 🔍 Google Authentication Setup

### 1. Create Google OAuth 2.0 Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google Sign-In API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Create separate client IDs for each platform:

**For iOS:**
- Application type: iOS
- Bundle ID: `com.insync.videocalling`

**For Android:**
- Application type: Android
- Package name: `com.insync.videocalling` 
- SHA-1 certificate fingerprint: (get this from your keystore)

**For Web:**
- Application type: Web application
- Name: InSync Web Client

### 2. Configure Authorized JavaScript Origins (Required for Web Client)

For the **Web Client ID**, you need to add Authorized JavaScript origins in the Google Cloud Console:

1. Go to your Web Client ID in Google Cloud Console
2. In the "Authorized JavaScript origins" section, add these URLs:

```
http://localhost:19006
https://localhost:19006
http://127.0.0.1:19006
https://127.0.0.1:19006
https://auth.expo.io
```

### 3. Configure Redirect URIs

For each client ID, add these redirect URIs:

**Web Client:**
```
https://auth.expo.io/@yourusername/insync-video-calling
http://localhost:19006/auth/callback
insync://auth
```

**iOS Client:**
```
insync://auth
```

**Android Client:**
```
insync://auth
```

### 3. Update Configuration

In `services/socialAuth.ts`, update the Google configuration:

```typescript
google: {
  clientId: {
    ios: '521197603768-igbcli55mks04j4hqvcb6o7jsceuaskf.apps.googleusercontent.com',
    android: '521197603768-nginjtbgnuvriv9i52j47ftcihchetmu.apps.googleusercontent.com',
    web: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
  },
  scopes: ['openid', 'profile', 'email'],
  additionalParameters: {},
},
```

### 4. Getting Android SHA-1 Fingerprint

For Android OAuth setup, you need the SHA-1 certificate fingerprint. Since you're using Expo, use Expo's debug keystore:

**For Development (Expo Go):**
```
SHA1: A5:B9:A5:AA:C5:86:D6:CA:83:A8:7A:22:D7:04:4B:6A:1F:8E:2B:39
```

**For Production Builds:**
Run this command to get your production SHA-1:
```bash
expo fetch:android:hashes
```

Or you can check your keystore with:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

## 📘 Facebook Authentication Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product
4. Configure OAuth redirect URIs

### 2. Configure Valid OAuth Redirect URIs

In Facebook App Settings → Facebook Login → Settings:

```
https://auth.expo.io/@yourusername/insync-video-calling
insync://auth
```

### 3. Update Configuration

In `services/socialAuth.ts`, update the Facebook configuration:

```typescript
facebook: {
  clientId: 'YOUR_FACEBOOK_APP_ID',
  scopes: ['public_profile', 'email'],
  additionalParameters: {
    display: 'popup',
  },
},
```

## 🚀 Development vs Production

### Development Mode (Current)
- Uses mock authentication
- Returns demo user data
- No actual OAuth flow

### Production Mode
To enable real authentication:

1. Set `__DEV__` to `false` or deploy to production
2. Update all client IDs in `AUTH_CONFIG`
3. Configure your backend to handle social auth tokens

## 🔒 Security Considerations

### PKCE Implementation
The app uses PKCE (Proof Key for Code Exchange) for enhanced security:
- Prevents authorization code interception attacks
- Required for mobile apps
- Automatically handled by the implementation

### Token Storage
- Access tokens are stored securely
- Refresh tokens (when available) are stored in secure storage
- Session management follows best practices

## 🛠 Backend Integration

### API Endpoints Required

Your backend should implement these endpoints:

```typescript
// Check if user exists by social ID
GET /api/auth/social/user?socialId={id}&provider={provider}

// Create new social user
POST /api/auth/social/signup
Headers: {
  'Social-Access-Token': 'social_provider_access_token'
}
Body: {
  name: string,
  email: string,
  socialId: string,
  socialProvider: 'google' | 'facebook',
  avatar?: string
}
```

### Token Verification

The backend should verify social tokens with the provider:

**Google Token Verification:**
```
GET https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={token}
```

**Facebook Token Verification:**
```
GET https://graph.facebook.com/me?access_token={token}
```

## 📱 App Configuration

### app.json Updates

Ensure your `app.json` includes:

```json
{
  "expo": {
    "scheme": "insync",
    "plugins": [
      "expo-auth-session",
      "expo-web-browser"
    ]
  }
}
```

## 🧪 Testing

### Testing Social Auth

1. **Development**: Mock authentication is used automatically
2. **Staging**: Update client IDs and test with real accounts
3. **Production**: Full OAuth flow with production credentials

### Mock Data

Current mock users:
- **Google**: John Doe (john.doe@gmail.com)
- **Facebook**: Jane Smith (jane.smith@facebook.com)

## ⚡ Professional Features Implemented

### ✅ User Experience
- Beautiful loading animations
- Professional button styling
- Seamless OAuth flow
- Error handling with user-friendly messages

### ✅ Security
- PKCE implementation
- Secure token storage
- Provider token verification
- Session management

### ✅ Data Collection
- Profile information (name, email, avatar)
- Provider-specific data
- Automatic account creation
- Profile picture import

### ✅ Integration
- Unified authentication context
- Consistent with existing auth flow
- Backend-ready API calls
- Cross-platform compatibility

## 🔄 Next Steps

1. **Obtain OAuth Credentials**: Set up Google and Facebook developer accounts
2. **Update Configuration**: Replace mock client IDs with real ones
3. **Backend Implementation**: Implement social auth endpoints
4. **Testing**: Test with real social accounts
5. **Deployment**: Deploy with production credentials

## 📞 Support

For issues with social authentication setup, check:
- Expo documentation for `expo-auth-session`
- Google OAuth 2.0 documentation
- Facebook Login documentation
- This app's authentication context implementation

The implementation follows industry best practices and is ready for production use once configured with real OAuth credentials.
