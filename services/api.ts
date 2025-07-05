import { authCircuitBreaker, meetingsCircuitBreaker, generalApiCircuitBreaker } from '@/utils/circuitBreaker';

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

export interface MeetingTemplateDto {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  type: 'GENERAL' | 'CLASSROOM' | 'BUSINESS' | 'ONE_ON_ONE';
  category: string;
  icon: string;
  color: string;
  participants: string;
  isDefault: boolean;
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
  // Real-time call states
  isMuted?: boolean;
  isVideoOn?: boolean;
  isHandRaised?: boolean;
  isScreenSharing?: boolean;
  isHost?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'poor';
}

// Extended participant type for UI display
export interface CallParticipant extends MeetingParticipantDto {
  name: string;
  avatar?: string;
  isPresenter?: boolean;
  isInBreakoutRoom?: boolean;
  breakoutRoomId?: string;
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

// Notification-related interfaces
export interface NotificationPreferenceDto {
  id?: number;
  emailMeetingReminder15Min: boolean;
  emailMeetingReminder5Min: boolean;
  emailMeetingStarted: boolean;
  emailMeetingEndingSoon: boolean;
  emailMeetingEnded: boolean;
  emailMeetingCancelled: boolean;
  emailMeetingRescheduled: boolean;
  smsMeetingReminder15Min: boolean;
  smsMeetingReminder5Min: boolean;
  smsMeetingStarted: boolean;
  smsMeetingEndingSoon: boolean;
  smsMeetingEnded: boolean;
  smsMeetingCancelled: boolean;
  smsMeetingRescheduled: boolean;
  pushMeetingReminder15Min: boolean;
  pushMeetingReminder5Min: boolean;
  pushMeetingStarted: boolean;
  pushMeetingEndingSoon: boolean;
  pushMeetingEnded: boolean;
  pushMeetingCancelled: boolean;
  pushMeetingRescheduled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RescheduleMeetingRequest {
  newStartTime: string;
  newEndTime?: string;
  reason?: string;
}

// Advanced calling feature interfaces
export interface CallStateUpdate {
  participantId: number;
  isMuted?: boolean;
  isVideoOn?: boolean;
  isHandRaised?: boolean;
  isScreenSharing?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: number;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'reaction';
}

export interface PollData {
  id: string;
  question: string;
  options: string[];
  responses: { [key: string]: number };
  isActive: boolean;
  createdBy: number;
  createdAt: Date;
}

export interface BreakoutRoom {
  id: string;
  name: string;
  participantIds: number[];
  isActive: boolean;
  maxParticipants: number;
}

export interface MeetingAnalytics {
  totalDuration: number;
  participantCount: number;
  engagementScore: number;
  talkTimeDistribution: { [key: number]: number };
  chatMessageCount: number;
  pollCount: number;
  screenShareDuration: number;
  recordingDuration: number;
}

export interface TranscriptionEntry {
  id: string;
  speaker: string;
  text: string;
  timestamp: Date;
  confidence: number;
}

// Meeting Settings Interfaces
export interface MeetingSettings {
  muteAllParticipants: boolean;
  enableWaitingRoom: boolean;
  enableRecording: boolean;
  hostAudioMuted: boolean;
  hostVideoOff: boolean;
  allowScreenSharing: boolean;
  allowChat: boolean;
  allowReactions: boolean;
  allowPolls: boolean;
  allowBreakoutRooms: boolean;
  maxParticipants: number;
  meetingPassword?: string;
  autoRecord: boolean;
  transcriptionEnabled: boolean;
}

export interface UpdateMeetingSettingsRequest {
  meetingId: string;
  settings: Partial<MeetingSettings>;
}

export interface MeetingSettingsResponse {
  meetingId: string;
  settings: MeetingSettings;
  updatedAt: string;
}

class ApiService {
  private token: string | null = null;
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly MAX_REQUESTS_PER_SECOND = 20; // Increased for video calling app
  private readonly RATE_LIMIT_WINDOW = 1000; // 1 second

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  // Reset rate limiter - useful for debugging or when starting new operations
  resetRateLimit() {
    this.requestCount = 0;
    this.lastRequestTime = 0;
    console.log('Rate limiter reset');
  }

  // Check if we're currently rate limited
  isRateLimited(): boolean {
    const now = Date.now();
    if (now - this.lastRequestTime > this.RATE_LIMIT_WINDOW) {
      return false;
    }
    return this.requestCount >= this.MAX_REQUESTS_PER_SECOND;
  }

  // Reset all circuit breakers and rate limiters - useful for debugging
  resetAllLimiters() {
    this.resetRateLimit();
    authCircuitBreaker.reset();
    meetingsCircuitBreaker.reset();
    generalApiCircuitBreaker.reset();
    console.log('All rate limiters and circuit breakers reset');
  }

  // Get current status of all limiters
  getLimiterStatus() {
    return {
      rateLimit: {
        isLimited: this.isRateLimited(),
        requestCount: this.requestCount,
        maxRequests: this.MAX_REQUESTS_PER_SECOND,
        timeWindow: this.RATE_LIMIT_WINDOW,
      },
      circuitBreakers: {
        auth: authCircuitBreaker.getState(),
        meetings: meetingsCircuitBreaker.getState(),
        general: generalApiCircuitBreaker.getState(),
      }
    };
  }

  // Debug method to test rate limiting without making real API calls
  testRateLimit(numRequests: number = 10): Promise<{
    success: number;
    rateLimited: number;
    results: Array<{ attempt: number; success: boolean; message: string }>;
  }> {
    return new Promise((resolve) => {
      let success = 0;
      let rateLimited = 0;
      const results: Array<{ attempt: number; success: boolean; message: string }> = [];

      for (let i = 1; i <= numRequests; i++) {
        setTimeout(() => {
          const canProceed = this.checkRateLimit();
          if (canProceed) {
            success++;
            results.push({ attempt: i, success: true, message: `Request ${i} allowed` });
          } else {
            rateLimited++;
            results.push({ attempt: i, success: false, message: `Request ${i} rate limited` });
          }

          if (i === numRequests) {
            resolve({ success, rateLimited, results });
          }
        }, i * 100); // 100ms apart
      }
    });
  }

  // Get a human-readable status of rate limiting
  getRateLimitStatus(): string {
    if (!this.isRateLimited()) {
      return `Rate limit OK: ${this.requestCount}/${this.MAX_REQUESTS_PER_SECOND} requests used`;
    }
    
    const timeToWait = Math.ceil((this.RATE_LIMIT_WINDOW - (Date.now() - this.lastRequestTime)) / 1000);
    return `Rate limited: Wait ${timeToWait} seconds (${this.requestCount}/${this.MAX_REQUESTS_PER_SECOND} requests used)`;
  }

  // Async method that waits until rate limit is clear
  async waitForRateLimit(): Promise<void> {
    if (!this.isRateLimited()) {
      return;
    }
    
    const timeToWait = this.RATE_LIMIT_WINDOW - (Date.now() - this.lastRequestTime);
    console.log(`Waiting ${timeToWait}ms for rate limit to clear...`);
    
    return new Promise(resolve => {
      setTimeout(resolve, timeToWait + 100); // Add 100ms buffer
    });
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset counter if enough time has passed
    if (now - this.lastRequestTime > this.RATE_LIMIT_WINDOW) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }
    
    // Check if we're exceeding the rate limit
    if (this.requestCount >= this.MAX_REQUESTS_PER_SECOND) {
      console.warn('Rate limit exceeded, request blocked');
      return false;
    }
    
    this.requestCount++;
    return true;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Check rate limit first
    if (!this.checkRateLimit()) {
      const timeToWait = Math.ceil((this.RATE_LIMIT_WINDOW - (Date.now() - this.lastRequestTime)) / 1000);
      throw new Error(`Rate limit exceeded. Please wait ${timeToWait} seconds before making more requests.`);
    }

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
          const authError = new Error(errorMsg);
          authError.name = 'AuthenticationError';
          throw authError;
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
    return authCircuitBreaker.execute(async () => {
      const response = await this.request<UserDto>('/users/me');
      if (response.data) {
        return response.data;
      }
      throw new Error('Failed to get user profile');
    });
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
    return meetingsCircuitBreaker.execute(async () => {
      const response = await this.request<MeetingDto[]>('/meetings/my');
      return response.data || [];
    });
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
    return meetingsCircuitBreaker.execute(async () => {
      const response = await this.request<MeetingDto>('/meetings/instant', {
        method: 'POST',
      });
      if (response.data) {
        console.log('Instant meeting created:', response.data.meetingId);
        return response.data;
      }
      throw new Error('Failed to create instant meeting');
    });
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

  async getMeetingTemplates(): Promise<MeetingTemplateDto[]> {
    const response = await this.request<MeetingTemplateDto[]>('/meetings/templates');
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

  // Notification Management
  async getNotificationPreferences(): Promise<NotificationPreferenceDto> {
    const response = await this.request<NotificationPreferenceDto>('/notifications/preferences');
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to get notification preferences');
  }

  async updateNotificationPreferences(preferences: NotificationPreferenceDto): Promise<NotificationPreferenceDto> {
    const response = await this.request<NotificationPreferenceDto>('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to update notification preferences');
  }

  async resetNotificationPreferences(): Promise<NotificationPreferenceDto> {
    const response = await this.request<NotificationPreferenceDto>('/notifications/preferences/reset', {
      method: 'POST',
    });
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to reset notification preferences');
  }

  // Enhanced Meeting Management with Notifications
  async cancelMeeting(meetingId: string): Promise<MeetingDto> {
    const response = await this.request<MeetingDto>(`/meetings/${meetingId}`, {
      method: 'DELETE',
    });
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to cancel meeting');
  }

  async rescheduleMeeting(meetingId: string, rescheduleData: RescheduleMeetingRequest): Promise<MeetingDto> {
    const response = await this.request<MeetingDto>(`/meetings/${meetingId}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify(rescheduleData),
    });
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to reschedule meeting');
  }

  // Auth diagnosis for debugging
  async diagnoseAuth() {
    const response = await this.request('/auth/diagnose');
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to diagnose authentication');
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

  // Authentication diagnostics - bypasses rate limiting for debugging
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

    console.log('=== Authentication Diagnosis (bypassing rate limits) ===');
    console.log('Token available:', diagnosis.hasToken);
    console.log('Token length:', diagnosis.tokenLength);

    // Skip detailed server tests if we don't have a token
    if (!diagnosis.hasToken) {
      diagnosis.error = 'No authentication token available';
      console.log('=== End Diagnosis: No Token ===');
      return diagnosis;
    }

    try {
      // Only test token validity without making multiple calls
      const tokenResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
      });
      
      diagnosis.canReachServer = true; // If we get any response, server is reachable
      
      if (tokenResponse.status === 200) {
        diagnosis.isTokenValid = true;
        console.log('Token is valid');
        
        // Try to get user info from token response if available
        try {
          const userData = await tokenResponse.json();
          if (userData && userData.user) {
            diagnosis.userInfo = userData.user;
          }
        } catch (e) {
          // If user data not in verify response, skip additional API call to avoid rate limits
          console.log('User data not available in verify response, skipping additional call');
        }
      } else {
        diagnosis.isTokenValid = false;
        try {
          const errorData = await tokenResponse.json();
          diagnosis.error = errorData.message || 'Token verification failed';
        } catch (e) {
          diagnosis.error = `Token verification failed with status ${tokenResponse.status}`;
        }
        console.log('Token verification failed:', diagnosis.error);
      }
    } catch (error) {
      diagnosis.canReachServer = false;
      diagnosis.isTokenValid = false;
      diagnosis.error = error instanceof Error ? error.message : 'Network error during diagnosis';
      console.log('Diagnosis error:', diagnosis.error);
    }

    console.log('=== End Diagnosis ===');
    return diagnosis;
  }

  // Advanced Call Management APIs
  async updateCallState(meetingId: string, callState: CallStateUpdate): Promise<ApiResponse> {
    return this.request(`/meetings/${meetingId}/call-state`, {
      method: 'PUT',
      body: JSON.stringify(callState),
    });
  }

  async getMeetingParticipants(meetingId: string): Promise<CallParticipant[]> {
    const response = await this.request<CallParticipant[]>(`/meetings/${meetingId}/participants`);
    return response.data || [];
  }

  async sendChatMessage(meetingId: string, message: string): Promise<ChatMessage> {
    const response = await this.request<any>(`/meetings/${meetingId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    if (response.data) {
      // Ensure timestamp is converted to Date object
      return {
        ...response.data,
        timestamp: response.data.timestamp ? new Date(response.data.timestamp) : new Date()
      };
    }
    throw new Error('Failed to send chat message');
  }

  async getChatMessages(meetingId: string): Promise<ChatMessage[]> {
    const response = await this.request<any[]>(`/meetings/${meetingId}/chat`);
    const messages = response.data || [];
    
    // Convert string timestamps to Date objects
    return messages.map(message => ({
      ...message,
      timestamp: message.timestamp ? new Date(message.timestamp) : new Date()
    }));
  }

  async createPoll(meetingId: string, question: string, options: string[]): Promise<PollData> {
    const response = await this.request<PollData>(`/meetings/${meetingId}/polls`, {
      method: 'POST',
      body: JSON.stringify({ question, options }),
    });
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to create poll');
  }

  async submitPollResponse(meetingId: string, pollId: string, optionIndex: number): Promise<ApiResponse> {
    return this.request(`/meetings/${meetingId}/polls/${pollId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ optionIndex }),
    });
  }

  async getActivePolls(meetingId: string): Promise<PollData[]> {
    const response = await this.request<PollData[]>(`/meetings/${meetingId}/polls/active`);
    return response.data || [];
  }

  async createBreakoutRoom(meetingId: string, name: string, maxParticipants: number): Promise<BreakoutRoom> {
    const response = await this.request<BreakoutRoom>(`/meetings/${meetingId}/breakout-rooms`, {
      method: 'POST',
      body: JSON.stringify({ name, maxParticipants }),
    });
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to create breakout room');
  }

  async joinBreakoutRoom(meetingId: string, roomId: string): Promise<ApiResponse> {
    return this.request(`/meetings/${meetingId}/breakout-rooms/${roomId}/join`, {
      method: 'POST',
    });
  }

  async leaveBreakoutRoom(meetingId: string, roomId: string): Promise<ApiResponse> {
    return this.request(`/meetings/${meetingId}/breakout-rooms/${roomId}/leave`, {
      method: 'POST',
    });
  }

  async getBreakoutRooms(meetingId: string): Promise<BreakoutRoom[]> {
    const response = await this.request<BreakoutRoom[]>(`/meetings/${meetingId}/breakout-rooms`);
    return response.data || [];
  }

  async startRecording(meetingId: string): Promise<ApiResponse> {
    return this.request(`/meetings/${meetingId}/recording/start`, {
      method: 'POST',
    });
  }

  async stopRecording(meetingId: string): Promise<ApiResponse> {
    return this.request(`/meetings/${meetingId}/recording/stop`, {
      method: 'POST',
    });
  }

  async getMeetingAnalytics(meetingId: string): Promise<MeetingAnalytics> {
    const response = await this.request<MeetingAnalytics>(`/meetings/${meetingId}/analytics`);
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to get meeting analytics');
  }

  async getTranscription(meetingId: string): Promise<TranscriptionEntry[]> {
    const response = await this.request<any[]>(`/meetings/${meetingId}/transcription`);
    const entries = response.data || [];
    
    // Convert string timestamps to Date objects
    return entries.map(entry => ({
      ...entry,
      timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date()
    }));
  }

  async exportMeetingData(meetingId: string, format: 'pdf' | 'excel' | 'video'): Promise<{ downloadUrl: string }> {
    const response = await this.request<{ downloadUrl: string }>(`/meetings/${meetingId}/export`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    });
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to export meeting data');
  }

  // Meeting Settings APIs
  async updateMeetingSettings(meetingId: string, settings: Partial<MeetingSettings>): Promise<MeetingSettingsResponse> {
    const response = await this.request<MeetingSettingsResponse>(`/meetings/${meetingId}/settings`, {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to update meeting settings');
  }

  async getMeetingSettings(meetingId: string): Promise<MeetingSettingsResponse> {
    const response = await this.request<MeetingSettingsResponse>(`/meetings/${meetingId}/settings`);
    if (response.data) {
      return response.data;
    }
    throw new Error('Failed to get meeting settings');
  }

  async applyHostSettings(meetingId: string, settings: {
    muteAll: boolean;
    waitingRoom: boolean;
    recording: boolean;
    hostMuted: boolean;
    hostVideoOff: boolean;
  }): Promise<ApiResponse> {
    return this.request(`/meetings/${meetingId}/host-settings`, {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }
}

export const apiService = new ApiService();