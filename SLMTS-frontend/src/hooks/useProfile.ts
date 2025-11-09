/**
 * Profile Management Hook
 * Custom React hook for user profile operations
 */

import { useState, useCallback } from 'react';
import { profileService, UpdateProfileRequest, ChangePasswordRequest, UserStatistics } from '@/services/api/profileService';
import { User } from '@/services/api/types';

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = useCallback(async (): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);
      const profile = await profileService.getProfile();
      return profile;
    } catch (error: any) {
      setError(error.message || 'Failed to fetch profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileRequest): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileService.updateProfile(data);
      return response.user;
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await profileService.changePassword(data);
      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to change password');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserStatistics = useCallback(async (): Promise<UserStatistics | null> => {
    try {
      setLoading(true);
      setError(null);
      const statistics = await profileService.getUserStatistics();
      return statistics;
    } catch (error: any) {
      setError(error.message || 'Failed to fetch user statistics');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getProfile,
    updateProfile,
    changePassword,
    getUserStatistics,
  };
};