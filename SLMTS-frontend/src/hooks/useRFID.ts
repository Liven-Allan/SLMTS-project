/**
 * RFID Management Hooks
 * Custom React hooks for RFID tag operations
 */

import { useState, useCallback, useEffect } from 'react';
import { rfidService } from '@/services/api/rfidService';
import { RFIDTag, CreateRFIDTagRequest, VerifyRFIDTagRequest } from '@/services/api/types';

export const useRFIDTags = () => {
  const [tags, setTags] = useState<RFIDTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRFIDTags = useCallback(async (params?: {
    status?: string;
    order?: number;
    search?: string;
    ordering?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await rfidService.getRFIDTags(params);
      setTags(response.results);
      setTotalCount(response.count);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch RFID tags');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStaffRFIDTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const tags = await rfidService.getStaffRFIDTags();
      setTags(tags);
      setTotalCount(tags.length);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch staff RFID tags');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchStaffRFIDTags();
  }, [fetchStaffRFIDTags]);

  return {
    tags,
    loading,
    error,
    totalCount,
    fetchRFIDTags,
    fetchStaffRFIDTags,
    refresh,
  };
};

export const useRFIDTag = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRFIDTag = async (data: CreateRFIDTagRequest): Promise<RFIDTag> => {
    try {
      setLoading(true);
      setError(null);
      const tag = await rfidService.createRFIDTag(data);
      return tag;
    } catch (error: any) {
      setError(error.message || 'Failed to create RFID tag');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateRFIDTag = async (id: number, data: Partial<RFIDTag>): Promise<RFIDTag> => {
    try {
      setLoading(true);
      setError(null);
      const tag = await rfidService.updateRFIDTag(id, data);
      return tag;
    } catch (error: any) {
      setError(error.message || 'Failed to update RFID tag');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyRFIDTag = async (id: number, data: VerifyRFIDTagRequest): Promise<RFIDTag> => {
    try {
      setLoading(true);
      setError(null);
      const response = await rfidService.verifyRFIDTag(id, data);
      return response.tag;
    } catch (error: any) {
      setError(error.message || 'Failed to verify RFID tag');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteRFIDTag = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await rfidService.deleteRFIDTag(id);
    } catch (error: any) {
      setError(error.message || 'Failed to delete RFID tag');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createRFIDTag,
    updateRFIDTag,
    verifyRFIDTag,
    deleteRFIDTag,
    loading,
    error,
  };
};