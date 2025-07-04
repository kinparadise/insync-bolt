const API_BASE_URL = 'http://10.232.200.20:8080/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  user: UserDto;
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  department?: string;
  status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY';
  lastSeen?: string;
  roles: string[];
  createdAt: string;
}

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  type: 'GENERAL' | 'CLASSROOM' | 'BUSINESS' | 'ONE_ON_ONE';
  participantIds?: number[];
}

export interface JoinMeetingRequest {
  meetingId: string;
}

export interface MeetingDto {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  host: UserDto;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  type: 'GENERAL' | 'CLASSROOM' | 'BUSINESS' | 'ONE_ON_ONE';
  meetingId: string;
  recordingUrl?: string;
  transcriptUrl?: string;
  participants?: MeetingParticipantDto[];
  actionItems?: ActionItemDto[];
  createdAt: string;
}

export interface MeetingParticipantDto {
  id: number;
  user: UserDto;
  joinTime?: string;
  leaveTime?: string;
  speakingTimeMinutes: number;
  cameraOnTimeMinutes: number;
  micOnTimeMinutes: number;
  messagesCount: number;
  engagementScore: number;
  status: 'INVITED' | 'JOINED' | 'LEFT' | 'REMOVED';
}

export interface ActionItemDto {
  id: number;
  task: string;
  description?: string;
  assignee?: UserDto;
  createdBy?: UserDto;
  dueDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      console.log(`Making API request to: ${url}`);
      console.log(`With auth header: ${!!this.token}`);
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Special handling for authentication errors
        if (response.status === 401 || response.status === 403) {
          console.error('Authentication failed for:', url);
          console.error('Response status:', response.status);
          console.error('Token was:', this.token ? 'present' : 'missing');
          
          // Get more details about the error
          try {
            console.error('Error response:', data);
          } catch (e) {
            console.error('Could not parse error response');
          }
          
          // Clear token if it's invalid
          this.clearToken();
          
          // Create a more specific error message
          const errorMsg = data.message || 'Authentication failed - please log in again';
          throw new Error(errorMsg);
        }
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        console.error('Network error: Could not reach backend at', url);
      } else {
        console.error('API Request failed:', error);
      }
      throw error;
    }
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<JwtResponse> {
    try {
      const url = `${API_BASE_URL}/auth/signin`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Backend returns JwtResponse directly, not wrapped in ApiResponse
      if (data.token && data.user) {
        this.setToken(data.token);
        return data;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        console.error('Network error: Could not reach backend at', `${API_BASE_URL}/auth/signin`);
      } else {
        console.error('Login failed:', error);
      }
      throw error;
    }
  }

  async signup(userData: SignupRequest): Promise<JwtResponse> {
    try {
      const url = `${API_BASE_URL}/auth/signup`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Backend returns JwtResponse directly, not wrapped in ApiResponse
      if (data.token && data.user) {
        this.setToken(data.token);
        return data;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        console.error('Network error: Could not reach backend at', `${API_BASE_URL}/auth/signup`);
      } else {
        console.error('Signup failed:', error);
      }
      throw error;
    }
  }

  async createAccount(userData: SignupRequest): Promise<{ success: boolean; message: string; user: UserDto }> {
    try {
      const url = `${API_BASE_URL}/auth/signup`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Account creation failed');
      }

      // Backend returns JwtResponse directly, but we don't set the token for createAccount
      if (data.token && data.user) {
        return {
          success: true,
          message: 'Account created successfully! Please log in with your credentials.',
          user: data.user
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        console.error('Network error: Could not reach backend at', `${API_BASE_URL}/auth/signup`);
      } else {
        console.error('Account creation failed:', error);
      }
      throw error;
    }
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/signout', {
      method: 'POST',
    });
    this.clearToken();
    return response;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // User Management
  async getCurrentUser(): Promise<UserDto> {
    const response = await this.request<UserDto>('/users/me');
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to get user profile');
  }

  async updateCurrentUser(userData: Partial<UserDto>): Promise<UserDto> {
    const response = await this.request<UserDto>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to update user profile');
  }

  async updateUserStatus(status: UserDto['status']): Promise<ApiResponse> {
    return this.request(`/users/me/status?status=${status}`, {
      method: 'PUT',
    });
  }

  async searchUsers(query: string): Promise<UserDto[]> {
    const response = await this.request<UserDto[]>(`/users/search?query=${encodeURIComponent(query)}`);
    return response.data || [];
  }

  async getAllUsers(): Promise<UserDto[]> {
    const response = await this.request<UserDto[]>('/users');
    return response.data || [];
  }

  async getUserById(id: number): Promise<UserDto> {
    const response = await this.request<UserDto>(`/users/${id}`);
    if (response.data) {
      return response.data;
    }
    throw new Error('User not found');
  }

  // Meeting Management
  async createMeeting(meetingData: CreateMeetingRequest): Promise<MeetingDto> {
    const response = await this.request<MeetingDto>('/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to create meeting');
  }

  async getUserMeetings(): Promise<MeetingDto[]> {
    const response = await this.request<MeetingDto[]>('/meetings/my');
    return response.data || [];
  }

  async getMeetingById(id: number): Promise<MeetingDto> {
    const response = await this.request<MeetingDto>(`/meetings/${id}`);
    if (response.data) {
      return response.data;
    }
    throw new Error('Meeting not found');
  }

  async createInstantMeeting(): Promise<MeetingDto> {
    console.log('Creating instant meeting...');
    const response = await this.request<MeetingDto>('/meetings/instant', {
      method: 'POST',
    });
    if (response.data) {
      console.log('Instant meeting created:', response.data.meetingId);
      return response.data;
    }
    throw new Error('Failed to create instant meeting');
  }

  async joinMeeting(id: number): Promise<ApiResponse> {
    console.log('Joining meeting ID:', id, 'Token available:', !!this.token);
    if (!this.token) {
      throw new Error('Authentication token is required to join meetings');
    }
    return this.request(`/meetings/${id}/join`, {
      method: 'POST',
    });
  }

  async joinMeetingByMeetingId(meetingId: string): Promise<MeetingDto> {
    console.log('Joining meeting by meeting ID:', meetingId);
    const response = await this.request<MeetingDto>('/meetings/join', {
      method: 'POST',
      body: JSON.stringify({ meetingId }),
    });
    if (response.data) {
      console.log('Successfully joined meeting:', response.data.title);
      return response.data;
    }
    throw new Error('Failed to join meeting');
  }

  async leaveMeeting(id: number): Promise<ApiResponse> {
    return this.request(`/meetings/${id}/leave`, {
      method: 'POST',
    });
  }

  async getUpcomingMeetings(): Promise<MeetingDto[]> {
    const response = await this.request<MeetingDto[]>('/meetings/upcoming');
    return response.data || [];
  }

  // Action Items
  async getActionItems(): Promise<ActionItemDto[]> {
    const response = await this.request<ActionItemDto[]>('/action-items/my');
    return response.data || [];
  }

  async createActionItem(actionItem: Partial<ActionItemDto>): Promise<ActionItemDto> {
    const response = await this.request<ActionItemDto>('/action-items', {
      method: 'POST',
      body: JSON.stringify(actionItem),
    });
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to create action item');
  }

  async updateActionItem(id: number, actionItem: Partial<ActionItemDto>): Promise<ActionItemDto> {
    const response = await this.request<ActionItemDto>(`/action-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(actionItem),
    });
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to update action item');
  }

  async deleteActionItem(id: number): Promise<ApiResponse> {
    return this.request(`/action-items/${id}`, {
      method: 'DELETE',
    });
  }

  // Token management utilities
  getToken(): string | null {
    return this.token;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      console.error('Token test failed:', error);
      return false;
    }
  }

  // Authentication diagnostics
  async diagnoseAuthentication(): Promise<{
    hasToken: boolean;
    tokenLength?: number;
    tokenPrefix?: string;
    canReachServer: boolean;
    isTokenValid: boolean;
    userInfo?: UserDto;
    error?: string;
  }> {
    const diagnosis = {
      hasToken: !!this.token,
      tokenLength: this.token?.length,
      tokenPrefix: this.token?.substring(0, 20) + '...',
      canReachServer: false,
      isTokenValid: false,
      userInfo: undefined as UserDto | undefined,
      error: undefined as string | undefined,
    };

    console.log('=== Authentication Diagnosis ===');
    console.log('Token available:', diagnosis.hasToken);
    console.log('Token length:', diagnosis.tokenLength);
    console.log('Token prefix:', diagnosis.tokenPrefix);

    try {
      // Test server connectivity
      const response = await fetch(`${API_BASE_URL}/auth/test`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      diagnosis.canReachServer = response.status === 200;
      console.log('Server reachable:', diagnosis.canReachServer);
    } catch (error) {
      console.log('Server connectivity error:', error);
      diagnosis.error = 'Cannot reach server';
    }

    if (diagnosis.hasToken) {
      try {
        // Test token validity using verification endpoint
        const tokenResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
        });
        
        if (tokenResponse.status === 200) {
          diagnosis.isTokenValid = true;
          console.log('Token is valid via auth/verify endpoint');
          
          // Also test with user info
          const userInfo = await this.getCurrentUser();
          diagnosis.userInfo = userInfo;
          console.log('Token valid, user:', userInfo.name, userInfo.email);
        } else {
          diagnosis.isTokenValid = false;
          const errorData = await tokenResponse.json();
          diagnosis.error = errorData.message || 'Token verification failed';
          console.log('Token verification failed:', diagnosis.error);
        }
      } catch (error) {
        diagnosis.isTokenValid = false;
        diagnosis.error = error instanceof Error ? error.message : 'Token validation failed';
        console.log('Token validation error:', diagnosis.error);
      }
    }

    console.log('=== End Diagnosis ===');
    return diagnosis;
  }
}

export const apiService = new ApiService();