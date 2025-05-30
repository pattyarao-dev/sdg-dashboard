import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (url: string, options?: RequestInit) => Promise<T | null>;
  reset: () => void;
}

export const useApi = <T>(): UseApiReturn<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null
  });

  const execute = useCallback(async (url: string, options?: RequestInit): Promise<T | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setState({ data, isLoading: false, error: null });
      return data;
    } catch (err) {
      let errorMessage = 'Unknown error occurred';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timeout - please try again';
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Connection failed - check if Python server is running';
        } else {
          errorMessage = err.message;
        }
      }
      
      setState({ data: null, isLoading: false, error: errorMessage });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
};

