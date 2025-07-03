import { useState, useEffect } from 'react';
import { apiService, MeetingDto, CreateMeetingRequest } from '@/services/api';

export const useMeetings = () => {
  const [meetings, setMeetings] = useState<MeetingDto[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<MeetingDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = async () => {
    setIsLoading(true);
    setError(null);
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

  const joinMeeting = async (meetingId: number) => {
    try {
      await apiService.joinMeeting(meetingId);
      // Refresh meetings to get updated status
      await fetchMeetings();
    } catch (err) {
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
    joinMeeting,
    leaveMeeting,
  };
};