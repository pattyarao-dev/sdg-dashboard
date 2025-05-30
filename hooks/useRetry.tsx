import { useState, useCallback } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

export const useRetry = (options: UseRetryOptions = {}) => {
  const { 
    maxRetries = 3, 
    retryDelay = 1000, 
    backoffMultiplier = 2 
  } = options;
  
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const executeWithRetry = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    onRetry?: (attempt: number) => void
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setIsRetrying(true);
          onRetry?.(attempt);
          await new Promise(resolve => 
            setTimeout(resolve, retryDelay * Math.pow(backoffMultiplier, attempt - 1))
          );
        }
        
        const result = await asyncFunction();
        setRetryCount(attempt);
        setIsRetrying(false);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        setRetryCount(attempt + 1);
        
        if (attempt === maxRetries) {
          setIsRetrying(false);
          throw lastError;
        }
      }
    }
    
    throw lastError!;
  }, [maxRetries, retryDelay, backoffMultiplier]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    executeWithRetry,
    retryCount,
    isRetrying,
    reset,
    canRetry: retryCount < maxRetries
  };
};