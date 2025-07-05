import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { Alert } from 'react-native';

// WebBrowser can be used on mobile and web platforms
WebBrowser.maybeCompleteAuthSession();

// Configuration for different auth providers
const AUTH_CONFIG = {
  google: {
    clientId: {
      ios: '521197603768-igbcli55mks04j4hqvcb6o7jsceuaskf.apps.googleusercontent.com',
      android: '521197603768-nginjtbgnuvriv9i52j47ftcihchetmu.apps.googleusercontent.com',
      web: 'YOUR_GOOGLE_WEB_CLIENT_ID',
    },
    scopes: ['openid', 'profile', 'email'],
  },
  facebook: {
    clientId: 'YOUR_FACEBOOK_APP_ID',
    scopes: ['public_profile', 'email'],
    additionalParameters: {
      display: 'popup',
    },
  },
};

export interface SocialAuthUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  provider: 'google' | 'facebook';
  accessToken: string;
  refreshToken?: string;
}

class SocialAuthService {
  // Google Authentication
  async signInWithGoogle(): Promise<SocialAuthUser | null> {
    try {
      const request = new AuthSession.AuthRequest({
        clientId: AUTH_CONFIG.google.clientId.web,
        scopes: AUTH_CONFIG.google.scopes,
        redirectUri: AuthSession.makeRedirectUri({
          scheme: 'insync',
          path: 'auth',
        }),
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
      });

      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      };
      
      const result = await request.promptAsync(discovery);

      if (result.type === 'success') {
        // Exchange the authorization code for access token
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId: AUTH_CONFIG.google.clientId.web,
            code: result.params.code,
            redirectUri: AuthSession.makeRedirectUri({
              scheme: 'insync',
              path: 'auth',
            }),
            extraParams: {
              code_verifier: request.codeVerifier || '',
            },
          },
          discovery
        );

        // Fetch user information
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResult.accessToken}`,
          },
        });

        const userInfo = await userInfoResponse.json();

        return {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
          provider: 'google',
          accessToken: tokenResult.accessToken,
          refreshToken: tokenResult.refreshToken,
        };
      }

      return null;
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('Authentication Error', 'Failed to sign in with Google. Please try again.');
      return null;
    }
  }

  // Facebook Authentication
  async signInWithFacebook(): Promise<SocialAuthUser | null> {
    try {
      const request = new AuthSession.AuthRequest({
        clientId: AUTH_CONFIG.facebook.clientId,
        scopes: AUTH_CONFIG.facebook.scopes,
        redirectUri: AuthSession.makeRedirectUri({
          scheme: 'insync',
          path: 'auth',
        }),
        responseType: AuthSession.ResponseType.Token,
      });

      const discovery = {
        authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
      };
      
      const result = await request.promptAsync(discovery);

      if (result.type === 'success') {
        // Fetch user information
        const userInfoResponse = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${result.params.access_token}`
        );

        const userInfo = await userInfoResponse.json();

        return {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture?.data?.url,
          provider: 'facebook',
          accessToken: result.params.access_token,
        };
      }

      return null;
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      Alert.alert('Authentication Error', 'Failed to sign in with Facebook. Please try again.');
      return null;
    }
  }

  // Mock authentication for development (remove in production)
  async mockGoogleAuth(): Promise<SocialAuthUser> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      id: 'google_mock_' + Math.random().toString(36).substr(2, 9),
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      picture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      provider: 'google',
      accessToken: 'mock_google_token_' + Math.random().toString(36).substr(2, 16),
    };
  }

  async mockFacebookAuth(): Promise<SocialAuthUser> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      id: 'facebook_mock_' + Math.random().toString(36).substr(2, 9),
      name: 'Jane Smith',
      email: 'jane.smith@facebook.com',
      picture: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      provider: 'facebook',
      accessToken: 'mock_facebook_token_' + Math.random().toString(36).substr(2, 16),
    };
  }

  // Utility method to check if running in development
  isDevelopment(): boolean {
    return __DEV__;
  }
}

export const socialAuthService = new SocialAuthService();
