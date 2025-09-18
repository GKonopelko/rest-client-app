import { useState, useCallback } from 'react';
import { RequestData, ResponseData } from '../types';
import { executeRequest } from '@/utils/requestHelpers';

export const useRequestHandler = () => {
  const [response, setResponse] = useState<ResponseData>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const execute = useCallback(async (request: RequestData) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await executeRequest(request);
      setResponse(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { response, isLoading, error, execute };
};
