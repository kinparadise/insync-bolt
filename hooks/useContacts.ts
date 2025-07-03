import { useState, useEffect } from 'react';
import { apiService, UserDto } from '@/services/api';

export const useContacts = () => {
  const [contacts, setContacts] = useState<UserDto[]>([]);
  const [allUsers, setAllUsers] = useState<UserDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // For now, we'll use all users as contacts since the contact system
      // needs additional backend endpoints
      const users = await apiService.getAllUsers();
      setContacts(users);
      setAllUsers(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const searchContacts = async (query: string) => {
    if (!query.trim()) {
      return allUsers;
    }
    
    try {
      const results = await apiService.searchUsers(query);
      return results;
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  };

  const updateUserStatus = async (status: UserDto['status']) => {
    try {
      await apiService.updateUserStatus(status);
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return {
    contacts,
    allUsers,
    isLoading,
    error,
    fetchContacts,
    searchContacts,
    updateUserStatus,
  };
};