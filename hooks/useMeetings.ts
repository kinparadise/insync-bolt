import { useState, useEffect, useRef } from 'react';
import { apiService, MeetingDto, CreateMeetingRequest } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { meetingsRateLimiter } from '@/utils/circuitBreaker';

export const useMeetings = () => {
  const [meetings, setMeetings] = useState<MeetingDto[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<MeetingDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading, ensureAuthenticated, diagnoseAuth } = useAuth();
  const fetchingRef = useRef(false); // Prevent concurrent fetches

  // Auto-fetch meetings when user is authenticated and auth is not loading
  useEffect(() => {
    // Early return if not authenticated
    if (!isAuthenticated || authLoading) {
      console.log('Authentication not ready, skipping meetings fetch');
      return;
    }

    if (!fetchingRef.current) {
      fetchMeetings();
    }
  }, [isAuthenticated, authLoading]);

  const fetchMeetings = async () => {
    if (fetchingRef.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }

    // Rate limiting check
    if (!meetingsRateLimiter.canExecute()) {
      console.log('Rate limited, skipping fetch. Next allowed in:', meetingsRateLimiter.getTimeUntilNext(), 'ms');
      return;
    }

    fetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    // Check if we have a token before making requests
    const token = apiService.getToken();
    if (!token) {
      setError('Authentication required');
      setIsLoading(false);
      fetchingRef.current = false;
      return;
    }
    
    try {
      const [allMeetings, upcoming] = await Promise.all([
        apiService.getUserMeetings(),
        apiService.getUpcomingMeetings(),
      ]);
      setMeetings(allMeetings);
      setUpcomingMeetings(upcoming);
      setError(null); // Clear any previous errors
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch meetings';
      setError(errorMessage);
      
      // If it's an authentication error, don't keep retrying
      if (err instanceof Error && err.name === 'AuthenticationError') {
        console.log('Authentication error detected, stopping fetch attempts');
        return;
      }
      
      // If circuit breaker is open, don't retry immediately
      if (errorMessage.includes('Circuit breaker is OPEN')) {
        console.log('Circuit breaker is open, stopping fetch attempts');
        return;
      }
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
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

  // Remove the duplicate useEffect that was causing double fetching
  // Initial fetch is handled by the useEffect above that monitors auth state

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