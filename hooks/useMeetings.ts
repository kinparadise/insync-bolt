import { useState, useEffect } from 'react';
import { apiService, MeetingDto, CreateMeetingRequest } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export const useMeetings = () => {
  const [meetings, setMeetings] = useState<MeetingDto[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<MeetingDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading, ensureAuthenticated, diagnoseAuth } = useAuth();

  // Auto-fetch meetings when user is authenticated and auth is not loading
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchMeetings();
    }
  }, [isAuthenticated, authLoading]);

  const fetchMeetings = async () => {
    setIsLoading(true);
    setError(null);
    
    // Check if we have a token before making requests
    const token = apiService.getToken();
    if (!token) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }
    
    try {
      const [allMeetings, upcoming] = await Promise.all([
        apiService.getUserMeetings(),
        apiService.getUpcomingMeetings(),
      ]);
      setMeetings(allMeetings);
      setUpcomingMeetings(upcoming);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meetings');
    } finally {
      setIsLoading(false);
    }
  };

  const createMeeting = async (meetingData: CreateMeetingRequest) => {
    try {
      const newMeeting = await apiService.createMeeting(meetingData);
      setMeetings(prev => [newMeeting, ...prev]);
      if (new Date(newMeeting.startTime) > new Date()) {
        setUpcomingMeetings(prev => [newMeeting, ...prev]);
      }
      return newMeeting;
    } catch (err) {
      throw err;
    }
  };

  const createInstantMeeting = async () => {
    try {
      console.log('=== Starting Create Instant Meeting Process ===');
      
      // Run authentication diagnosis first
      const authDiagnosis = await diagnoseAuth();
      console.log('Auth diagnosis result:', authDiagnosis);

      // Ensure we have valid authentication
      const isAuth = await ensureAuthenticated();
      if (!isAuth) {
        throw new Error('Authentication required. Please log in again.');
      }

      console.log('Authentication verified, creating instant meeting...');
      const newMeeting = await apiService.createInstantMeeting();
      
      console.log('Instant meeting created successfully:', newMeeting.meetingId);
      
      // Add to meetings list
      setMeetings(prev => [newMeeting, ...prev]);
      setUpcomingMeetings(prev => [newMeeting, ...prev]);
      
      console.log('=== Create Instant Meeting Process Complete ===');
      return newMeeting;
    } catch (err) {
      console.error('=== Create Instant Meeting Failed ===');
      console.error('Error details:', err);
      throw err;
    }
  };

  const joinMeeting = async (meetingId: number) => {
    try {
      console.log('=== Starting Join Meeting Process ===');
      console.log('Meeting ID:', meetingId);
      
      // Run authentication diagnosis first
      const authDiagnosis = await diagnoseAuth();
      console.log('Auth diagnosis result:', authDiagnosis);

      // Ensure we have valid authentication
      const isAuth = await ensureAuthenticated();
      if (!isAuth) {
        throw new Error('Authentication required. Please log in again.');
      }

      console.log('Authentication verified, making join request...');
      
      await apiService.joinMeeting(meetingId);
      
      console.log('Join meeting successful, refreshing meetings...');
      // Refresh meetings to get updated status
      await fetchMeetings();
      console.log('=== Join Meeting Process Complete ===');
    } catch (err) {
      console.error('=== Join Meeting Failed ===');
      console.error('Error details:', err);
      
      // Run diagnosis again to see what changed
      const postErrorDiagnosis = await diagnoseAuth();
      console.log('Post-error diagnosis:', postErrorDiagnosis);
      
      throw err;
    }
  };

  const joinMeetingByMeetingId = async (meetingId: string) => {
    try {
      console.log('=== Starting Join Meeting By ID Process ===');
      console.log('Meeting ID:', meetingId);
      
      // Run authentication diagnosis first
      const authDiagnosis = await diagnoseAuth();
      console.log('Auth diagnosis result:', authDiagnosis);

      // Ensure we have valid authentication
      const isAuth = await ensureAuthenticated();
      if (!isAuth) {
        throw new Error('Authentication required. Please log in again.');
      }

      console.log('Authentication verified, joining meeting by ID...');
      const meeting = await apiService.joinMeetingByMeetingId(meetingId);
      
      console.log('Join by ID successful for meeting:', meeting.title);
      
      // Refresh meetings to get updated status
      await fetchMeetings();
      console.log('=== Join Meeting By ID Process Complete ===');
      return meeting;
    } catch (err) {
      console.error('=== Join Meeting By ID Failed ===');
      console.error('Error details:', err);
      throw err;
    }
  };

  const leaveMeeting = async (meetingId: number) => {
    try {
      await apiService.leaveMeeting(meetingId);
      // Refresh meetings to get updated status
      await fetchMeetings();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return {
    meetings,
    upcomingMeetings,
    isLoading,
    error,
    fetchMeetings,
    createMeeting,
    createInstantMeeting,
    joinMeeting,
    joinMeetingByMeetingId,
    leaveMeeting,
  };
};