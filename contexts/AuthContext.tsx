import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, UserDto, LoginRequest, SignupRequest } from '@/services/api';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  user: UserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  createAccount: (userData: SignupRequest) => Promise<{ success: boolean; message: string; user: UserDto }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<UserDto>) => Promise<void>;
  updateUserStatus: (status: UserDto['status']) => Promise<void>;
  testAuth: () => Promise<boolean>;
  refreshAuth: () => Promise<void>;
  ensureAuthenticated: () => Promise<boolean>;
  diagnoseAuth: () => Promise<any>;
  // New enhanced persistence methods
  enableRememberMe: (enabled: boolean) => Promise<void>;
  isRememberMeEnabled: () => Promise<boolean>;
  clearAllData: () => Promise<void>;
  getSessionInfo: () => Promise<SessionInfo>;
}

interface SessionInfo {
  lastLoginTime: string;
  sessionDuration: number;
  deviceInfo: string;
  loginCount: number;
  isRememberMeEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const TOKEN_KEY = '@insync_token';
const USER_KEY = '@insync_user';
const REMEMBER_ME_KEY = '@insync_remember_me';
const SESSION_INFO_KEY = '@insync_session_info';
const LOGIN_COUNT_KEY = '@insync_login_count';
const DEVICE_ID_KEY = '@insync_device_id';

// Secure storage keys (for sensitive data)
const SECURE_TOKEN_KEY = 'insync_secure_token';
const SECURE_REFRESH_TOKEN_KEY = 'insync_refresh_token';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Enhanced storage methods
  const storeToken = async (token: string, rememberMe: boolean = false) => {
    if (rememberMe) {
      // Store in secure storage for better security
      await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
    } else {
      // Store in regular AsyncStorage for session-only persistence
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
  };

  const getStoredToken = async (): Promise<string | null> => {
    // Try secure storage first, then regular storage
    const secureToken = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
    if (secureToken) return secureToken;
    
    return await AsyncStorage.getItem(TOKEN_KEY);
  };

  const clearStoredToken = async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(SECURE_TOKEN_KEY),
      AsyncStorage.removeItem(TOKEN_KEY),
    ]);
  };

  const generateDeviceId = async (): Promise<string> => {
    const existingId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existingId) return existingId;
    
    // Generate a unique device identifier
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    return deviceId;
  };

  const updateSessionInfo = async (action: 'login' | 'logout' | 'refresh') => {
    const deviceId = await generateDeviceId();
    const now = new Date();
    
    let sessionInfo: SessionInfo = {
      lastLoginTime: now.toISOString(),
      sessionDuration: 0,
      deviceInfo: deviceId,
      loginCount: 0,
      isRememberMeEnabled: false,
    };

    if (action === 'login') {
      const currentCount = await AsyncStorage.getItem(LOGIN_COUNT_KEY);
      const newCount = (parseInt(currentCount || '0') + 1).toString();
      await AsyncStorage.setItem(LOGIN_COUNT_KEY, newCount);
      sessionInfo.loginCount = parseInt(newCount);
      
      const rememberMe = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      sessionInfo.isRememberMeEnabled = rememberMe === 'true';
      
      setSessionStartTime(now);
    } else if (action === 'logout') {
      if (sessionStartTime) {
        sessionInfo.sessionDuration = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
      }
    }

    await AsyncStorage.setItem(SESSION_INFO_KEY, JSON.stringify(sessionInfo));
  };

  const loadStoredAuth = async () => {
    try {
      console.log('Loading stored authentication...');
      
      const [storedToken, storedUser, rememberMe] = await Promise.all([
        getStoredToken(),
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(REMEMBER_ME_KEY),
      ]);

      console.log('Stored token exists:', !!storedToken);
      console.log('Stored user exists:', !!storedUser);
      console.log('Remember me enabled:', rememberMe === 'true');

      if (storedToken && storedUser) {
        console.log('Setting token in API service...');
        apiService.setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        console.log('Token set in API service, user authenticated from storage');
        
        // Verify token is still valid
        try {
          const currentUser = await apiService.getCurrentUser();
          console.log('Token verification successful, updating user data');
          setUser(currentUser);
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(currentUser));
          
          // Update session info
          await updateSessionInfo('refresh');
        } catch (error) {
          console.log('Token verification failed, clearing authentication');
          await clearStoredAuth();
        }
      } else {
        console.log('No stored authentication found');
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      await clearStoredAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const clearStoredAuth = async () => {
    await Promise.all([
      clearStoredToken(),
      AsyncStorage.removeItem(USER_KEY),
      AsyncStorage.removeItem(REMEMBER_ME_KEY),
    ]);
    apiService.clearToken();
    setUser(null);
    setSessionStartTime(null);
  };

  const login = async (credentials: LoginRequest, rememberMe: boolean = false) => {
    try {
      console.log('Attempting login...');
      const response = await apiService.login(credentials);
      
      console.log('Login successful, setting token and user');
      apiService.setToken(response.token);
      
      // Store authentication data
      await Promise.all([
        storeToken(response.token, rememberMe),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user)),
        AsyncStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString()),
      ]);
      
      console.log('User data stored successfully');
      setUser(response.user);
      setSessionStartTime(new Date());
      
      // Update session info
      await updateSessionInfo('login');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (userData: SignupRequest, rememberMe: boolean = false) => {
    try {
      const response = await apiService.signup(userData);
      await Promise.all([
        storeToken(response.token, rememberMe),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user)),
        AsyncStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString()),
      ]);
      setUser(response.user);
      setSessionStartTime(new Date());
      await updateSessionInfo('login');
    } catch (error) {
      throw error;
    }
  };

  const createAccount = async (userData: SignupRequest) => {
    try {
      return await apiService.createAccount(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await updateSessionInfo('logout');
      await clearStoredAuth();
    }
  };

  const updateUser = async (userData: Partial<UserDto>) => {
    try {
      const updatedUser = await apiService.updateCurrentUser(userData);
      setUser(updatedUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  };

  const updateUserStatus = async (status: UserDto['status']) => {
    try {
      await apiService.updateUserStatus(status);
      if (user) {
        const updatedUser = { ...user, status };
        setUser(updatedUser);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
    } catch (error) {
      throw error;
    }
  };

  const testAuth = async () => {
    try {
      const isValid = await apiService.testConnection();
      if (!isValid) {
        console.warn('Authentication test failed, clearing auth data');
        await clearStoredAuth();
      }
      return isValid;
    } catch (error) {
      console.error('Auth test error:', error);
      return false;
    }
  };

  const refreshAuth = async () => {
    console.log('Refreshing authentication...');
    await loadStoredAuth();
  };

  const ensureAuthenticated = async () => {
    const token = apiService.getToken();
    const hasUser = !!user;
    
    if (token && hasUser) {
      return true;
    }
    
    if (hasUser && !token) {
      console.log('Token missing but user exists, attempting refresh...');
      try {
        const storedToken = await getStoredToken();
        if (storedToken) {
          apiService.setToken(storedToken);
          return true;
        }
      } catch (error) {
        console.error('Failed to refresh token from storage:', error);
      }
    }
    
    console.log('Authentication not available');
    return false;
  };

  const diagnoseAuth = async () => {
    console.log('Running authentication diagnosis...');
    return await apiService.diagnoseAuthentication();
  };

  // New enhanced persistence methods
  const enableRememberMe = async (enabled: boolean) => {
    await AsyncStorage.setItem(REMEMBER_ME_KEY, enabled.toString());
    
    // If enabling remember me and we have a token, move it to secure storage
    if (enabled) {
      const currentToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (currentToken) {
        await SecureStore.setItemAsync(SECURE_TOKEN_KEY, currentToken);
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
    }
  };

  const isRememberMeEnabled = async (): Promise<boolean> => {
    const rememberMe = await AsyncStorage.getItem(REMEMBER_ME_KEY);
    return rememberMe === 'true';
  };

  const clearAllData = async () => {
    await Promise.all([
      clearStoredAuth(),
      AsyncStorage.removeItem(LOGIN_COUNT_KEY),
      AsyncStorage.removeItem(SESSION_INFO_KEY),
      AsyncStorage.removeItem(DEVICE_ID_KEY),
    ]);
  };

  const getSessionInfo = async (): Promise<SessionInfo> => {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_INFO_KEY);
      if (sessionData) {
        return JSON.parse(sessionData);
      }
    } catch (error) {
      console.error('Error loading session info:', error);
    }
    
    return {
      lastLoginTime: new Date().toISOString(),
      sessionDuration: 0,
      deviceInfo: await generateDeviceId(),
      loginCount: 0,
      isRememberMeEnabled: false,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateUser,
        updateUserStatus,
        createAccount,
        testAuth,
        refreshAuth,
        ensureAuthenticated,
        diagnoseAuth,
        enableRememberMe,
        isRememberMeEnabled,
        clearAllData,
        getSessionInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};