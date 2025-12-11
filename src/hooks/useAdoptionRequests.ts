import { useState, useEffect, useCallback } from 'react';
import { AdoptionRequestDTO, CreateAdoptionRequestDTO, UpdateAdoptionRequestStatusDTO } from '@/dtos/adoptionRequestDto';
import * as adoptionRequestService from '@/services/adoptionRequestService';
import { AdoptionRequestStatus } from '@/enums/adoptionRequestStatus-enum';

export function useAdoptionRequests() {
  const [myRequests, setMyRequests] = useState<AdoptionRequestDTO[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<AdoptionRequestDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch adoption requests made by current user
  const fetchMyRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adoptionRequestService.getMyAdoptionRequests();
      if (result.success) {
        setMyRequests(result.value);
      } else {
        setError(result.errors.join(', '));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch your adoption requests');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch adoption requests received for user's pets
  const fetchReceivedRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adoptionRequestService.getReceivedAdoptionRequests();
      if (result.success) {
        setReceivedRequests(result.value);
      } else {
        setError(result.errors.join(', '));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch received adoption requests');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new adoption request
  const createRequest = useCallback(async (data: CreateAdoptionRequestDTO) => {
    try {
      setLoading(true);
      setError(null);
      const result = await adoptionRequestService.createAdoptionRequest(data);
      if (result.success) {
        await fetchMyRequests(); // Refresh the list
        return { success: true, data: result.value };
      } else {
        setError(result.errors.join(', '));
        return { success: false, error: result.errors.join(', ') };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create adoption request';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [fetchMyRequests]);

  // Update request status (for owners)
  const updateRequestStatus = useCallback(async (
    requestId: string,
    data: UpdateAdoptionRequestStatusDTO
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await adoptionRequestService.updateAdoptionRequestStatus(requestId, data);
      if (result.success) {
        await fetchReceivedRequests(); // Refresh the list
        return { success: true, data: result.value };
      } else {
        setError(result.errors.join(', '));
        return { success: false, error: result.errors.join(', ') };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update request status';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [fetchReceivedRequests]);

  // Cancel a request (for adopters)
  const cancelRequest = useCallback(async (requestId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await adoptionRequestService.cancelAdoptionRequest(requestId);
      if (result.success) {
        await fetchMyRequests(); // Refresh the list
        return { success: true };
      } else {
        setError(result.errors.join(', '));
        return { success: false, error: result.errors.join(', ') };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to cancel request';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [fetchMyRequests]);

  // Check if user has pending request for a specific pet
  const checkPendingRequest = useCallback(async (petId: string) => {
    try {
      const result = await adoptionRequestService.checkPendingRequestForPet(petId);
      if (result.success) {
        return result.value;
      }
      return null;
    } catch (err) {
      console.error('Failed to check pending request:', err);
      return null;
    }
  }, []);

  // Get summary counts
  const getSummary = useCallback((requests: AdoptionRequestDTO[]) => {
    return {
      total: requests.length,
      pending: requests.filter(r => 
        r.status === AdoptionRequestStatus.Submitted ||
        r.status === AdoptionRequestStatus.UnderReview ||
        r.status === AdoptionRequestStatus.Interview
      ).length,
      approved: requests.filter(r => r.status === AdoptionRequestStatus.Approved).length,
      rejected: requests.filter(r => r.status === AdoptionRequestStatus.Rejected).length,
      cancelled: requests.filter(r => r.status === AdoptionRequestStatus.Cancelled).length,
    };
  }, []);

  return {
    myRequests,
    receivedRequests,
    loading,
    error,
    fetchMyRequests,
    fetchReceivedRequests,
    createRequest,
    updateRequestStatus,
    cancelRequest,
    checkPendingRequest,
    getSummary,
  };
}

