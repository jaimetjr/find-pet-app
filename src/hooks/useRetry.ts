import { useState, useCallback } from 'react';

interface UseRetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
}

export const useRetry = (options: UseRetryOptions = {}) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoffMultiplier = 2,
  } = options;

  const [attempts, setAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error, attempt: number) => void
  ): Promise<T | null> => {
    let currentAttempt = 0;
    let currentDelay = delay;

    while (currentAttempt < maxAttempts) {
      try {
        setIsRetrying(true);
        setAttempts(currentAttempt + 1);
        
        const result = await operation();
        
        // Success - reset state
        setIsRetrying(false);
        setAttempts(0);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (error) {
        currentAttempt++;
        
        if (onError) {
          onError(error as Error, currentAttempt);
        }
        
        // If this is the last attempt, don't wait
        if (currentAttempt >= maxAttempts) {
          setIsRetrying(false);
          throw error;
        }
        
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= backoffMultiplier;
      }
    }
    
    setIsRetrying(false);
    return null;
  }, [maxAttempts, delay, backoffMultiplier]);

  const reset = useCallback(() => {
    setAttempts(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    reset,
    attempts,
    isRetrying,
    hasAttemptsLeft: attempts < maxAttempts,
  };
}; 