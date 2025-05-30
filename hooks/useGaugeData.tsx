// hooks/useGoalData.ts
import { useState, useEffect, useCallback } from 'react';
import { GoalSummary } from '@/types/dashboard.types';

interface UseGoalDataParams {
  goal_id: number;
  year?: number;
  month?: number;
  project_id?: number;
  location?: string;
  enabled?: boolean;
}

interface UseGoalDataReturn {
  goalData: GoalSummary | null;
  allGoalsData: GoalSummary[]; // Return all goals data for efficiency
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
  message: string | null; // API message (e.g., "No data found for the specified filters")
  refetch: () => void;
  retry: () => void;
}

export const useGoalData = ({
  goal_id,
  year,
  month,
  project_id,
  location,
  enabled = true
}: UseGoalDataParams): UseGoalDataReturn => {
  const [goalData, setGoalData] = useState<GoalSummary | null>(null);
  const [allGoalsData, setAllGoalsData] = useState<GoalSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchGoalData = useCallback(async () => {
    if (!goal_id || !enabled) return;
    
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      // Construct query parameters - only include non-empty values
      const params = new URLSearchParams();
      if (year !== undefined && year !== null) params.append('year', year.toString());
      if (month !== undefined && month !== null) params.append('month', month.toString());
      if (project_id !== undefined && project_id !== null) params.append('project_id', project_id.toString());
      if (location && location.trim()) params.append('location', location.trim());
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout for slower connections
      
      const queryString = params.toString();
      const url = `http://localhost:8000/api/indicators/goal-summary${queryString ? `?${queryString}` : ''}`;
      
      console.log(`Fetching data from: ${url}`); // Debug log
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Handle specific HTTP errors
        if (response.status === 404) {
          throw new Error('API endpoint not found - check server is running');
        } else if (response.status === 500) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Server error: ${response.statusText}`);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
      
      const result = await response.json();
      
      // Handle the API response structure
      if (result.data && Array.isArray(result.data)) {
        setAllGoalsData(result.data);
        
        // Find the specific goal data
        const goalSummary = result.data.find((item: GoalSummary) => item.goal_id === goal_id);
        
        if (goalSummary) {
          setGoalData(goalSummary);
          setHasData(true);
        } else {
          setGoalData(null);
          setHasData(false);
        }
        
        // Set message if provided by API
        if (result.message) {
          setMessage(result.message);
        }
      } else {
        // Unexpected response structure
        setGoalData(null);
        setAllGoalsData([]);
        setHasData(false);
        setMessage(result.message || 'Unexpected response format');
      }
      
    } catch (err) {
      console.error('Goal data fetch error:', err); // Debug log
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timeout - server may be slow or unavailable');
        } else if (err.message.includes('Failed to fetch') || err.message.includes('fetch')) {
          setError('Cannot connect to Python server - is it running on localhost:8000?');
        } else {
          setError(err.message);
        }
      } else {
        setError('Unknown error occurred while fetching data');
      }
      
      setGoalData(null);
      setAllGoalsData([]);
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  }, [goal_id, year, month, project_id, location, enabled]);

  useEffect(() => {
    fetchGoalData();
  }, [fetchGoalData]);

  const refetch = useCallback(() => {
    fetchGoalData();
  }, [fetchGoalData]);

  const retry = useCallback(() => {
    setError(null);
    setMessage(null);
    fetchGoalData();
  }, [fetchGoalData]);

  return {
    goalData,
    allGoalsData,
    isLoading,
    error,
    hasData,
    message,
    refetch,
    retry
  };
};
