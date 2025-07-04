const API_BASE_URL = 'http://192.168.146.1:8080/api';

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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<JwtResponse> {
    const response = await this.request<JwtResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.data) {
      this.setToken(response.data.token);
      return response.data;
    }
    
    throw new Error('Login failed');
  }

  async signup(userData: SignupRequest): Promise<ApiResponse> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
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

  async joinMeeting(id: number): Promise<ApiResponse> {
    return this.request(`/meetings/${id}/join`, {
      method: 'POST',
    });
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
}

export const apiService = new ApiService();