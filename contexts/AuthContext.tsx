import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, UserDto, LoginRequest, SignupRequest } from '@/services/api';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@insync_token';
const USER_KEY = '@insync_user';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      console.log('Loading stored authentication...');
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      console.log('Stored token exists:', !!storedToken);
      console.log('Stored user exists:', !!storedUser);

      if (storedToken && storedUser) {
        console.log('Setting token in API service...');
        apiService.setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        console.log('Token set in API service, verifying with server...');
        
        // Verify token is still valid by fetching current user
        try {
          const currentUser = await apiService.getCurrentUser();
          console.log('Token verification successful, user:', currentUser.email);
          setUser(currentUser);
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        } catch (error) {
          // Token is invalid, clear stored data
          console.log('Stored token is invalid or expired, clearing auth data');
          console.log('Error details:', error);
          
          // Check if it's a network error vs authentication error
          if (error instanceof Error && error.message.includes('Network request failed')) {
            console.log('Network error during token validation - keeping user logged in for now');
            // Keep the user logged in with stored data, will retry later
          } else {
            console.log('Authentication error - token is invalid, logging out');
            await clearStoredAuth();
          }
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
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
    apiService.clearToken();
    setUser(null);
  };

  const login = async (credentials: LoginRequest) => {
    try {
      console.log('Attempting login...');
      const response = await apiService.login(credentials);
      
      console.log('Login successful, setting token and user');
      // Ensure token is set in apiService
      apiService.setToken(response.token);
      
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, response.token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user)),
      ]);
      
      console.log('User data stored successfully');
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (userData: SignupRequest) => {
    try {
      const response = await apiService.signup(userData);
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, response.token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user)),
      ]);
      setUser(response.user);
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
    if (!token && user) {
      console.log('Token missing but user exists, refreshing auth...');
      await refreshAuth();
    }
    return !!apiService.getToken();
  };

  const diagnoseAuth = async () => {
    console.log('Running authentication diagnosis...');
    return await apiService.diagnoseAuthentication();
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