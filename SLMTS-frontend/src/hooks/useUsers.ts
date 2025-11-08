/**
 * React Hooks for User Management
 * Custom hooks for managing user state and API operations
 */

import { useState, useEffect, useCallback } from 'react';
import { UserService } from '@/services/api';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserQueryParams,
  PaginatedResponse,
  UserStats,
  ApiError,
} from '@/services/api/types';

// =============================================================================
// TYPES FOR HOOKS
// =============================================================================

interface UseUsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface UseUserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface UseUserStatsState {
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
}

// =============================================================================
// USERS LIST HOOK
// =============================================================================

/**
 * Hook for managing users list with filtering and pagination
 */
export const useUsers = (initialParams?: UserQueryParams) => {
  const [state, setState] = useState<UseUsersState>({
    users: [],
    loading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    hasNext: false,
    hasPrevious: false,
  });

  const [queryParams, setQueryParams] = useState<UserQueryParams>(
    initialParams || {}
  );

  /**
   * Fetch users from API
   */
  const fetchUsers = useCallback(async (params?: UserQueryParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response: PaginatedResponse<User> = await UserService.getUsers(
        params || queryParams
      );

      setState(prev => ({
        ...prev,
        users: response.results,
        totalCount: response.count,
        hasNext: !!response.next,
        hasPrevious: !!response.previous,
        loading: false,
      }));
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message || 'Failed to fetch users',
      }));
    }
  }, [queryParams]);

  /**
   * Update query parameters and refetch
   */
  const updateParams = useCallback((newParams: Partial<UserQueryParams>) => {
    const updatedParams = { ...queryParams, ...newParams };
    setQueryParams(updatedParams);
    fetchUsers(updatedParams);
  }, [queryParams, fetchUsers]);

  /**
   * Search users
   */
  const searchUsers = useCallback((searchTerm: string) => {
    updateParams({ search: searchTerm, page: 1 });
  }, [updateParams]);

  /**
   * Filter by role
   */
  const filterByRole = useCallback((role: string | undefined) => {
    updateParams({ role: role as any, page: 1 });
  }, [updateParams]);

  /**
   * Filter by status
   */
  const filterByStatus = useCallback((status: string | undefined) => {
    updateParams({ status: status as any, page: 1 });
  }, [updateParams]);

  /**
   * Change page
   */
  const changePage = useCallback((page: number) => {
    updateParams({ page });
  }, [updateParams]);

  /**
   * Refresh users list
   */
  const refresh = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    ...state,
    queryParams,
    fetchUsers,
    updateParams,
    searchUsers,
    filterByRole,
    filterByStatus,
    changePage,
    refresh,
  };
};

// =============================================================================
// SINGLE USER HOOK
// =============================================================================

/**
 * Hook for managing single user operations
 */
export const useUser = (userId?: number) => {
  const [state, setState] = useState<UseUserState>({
    user: null,
    loading: false,
    error: null,
  });

  /**
   * Fetch user by ID
   */
  const fetchUser = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const user = await UserService.getUserById(id);
      setState(prev => ({ ...prev, user, loading: false }));
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message || 'Failed to fetch user',
      }));
    }
  }, []);

  /**
   * Create new user
   */
  const createUser = useCallback(async (userData: CreateUserRequest): Promise<User | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const user = await UserService.createUser(userData);
      setState(prev => ({ ...prev, user, loading: false }));
      return user;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message || 'Failed to create user',
      }));
      return null;
    }
  }, []);

  /**
   * Update user
   */
  const updateUser = useCallback(async (
    id: number,
    userData: Partial<UpdateUserRequest>
  ): Promise<User | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const user = await UserService.updateUser(id, userData);
      setState(prev => ({ ...prev, user, loading: false }));
      return user;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message || 'Failed to update user',
      }));
      return null;
    }
  }, []);

  /**
   * Delete user
   */
  const deleteUser = useCallback(async (id: number): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await UserService.deleteUser(id);
      setState(prev => ({ ...prev, user: null, loading: false }));
      return true;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message || 'Failed to delete user',
      }));
      return false;
    }
  }, []);

  // Fetch user on mount if ID provided
  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId, fetchUser]);

  return {
    ...state,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
  };
};

// =============================================================================
// USER STATS HOOK
// =============================================================================

/**
 * Hook for user statistics
 */
export const useUserStats = () => {
  const [state, setState] = useState<UseUserStatsState>({
    stats: null,
    loading: false,
    error: null,
  });

  /**
   * Fetch user statistics
   */
  const fetchStats = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const stats = await UserService.getUserStats();
      setState(prev => ({ ...prev, stats, loading: false }));
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message || 'Failed to fetch user statistics',
      }));
    }
  }, []);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...state,
    fetchStats,
  };
};