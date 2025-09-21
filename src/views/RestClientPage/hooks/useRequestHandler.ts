import { useState, useCallback } from 'react';
import { RequestData, ResponseData } from '../types';
import { executeRequest } from '@/utils/requestHelpers';
import { interpolateVariables } from '@/utils/variablesUtils';
import { Variable } from '@/utils/variablesUtils';
import { saveRequest } from '@/lib/firebase/historyService';
import { useSelector } from 'react-redux';
import { selectUserId } from '@/slices/userSlice';
import { RootState } from '@/store';

interface UseRequestHandlerProps {
  variables: Variable[];
  onSuccess?: (response: ResponseData) => void;
  onError?: (error: string) => void;
}

export const useRequestHandler = ({
  variables,
  onSuccess,
  onError,
}: UseRequestHandlerProps) => {
  const [response, setResponse] = useState<ResponseData>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const userId = useSelector((state: RootState) => selectUserId(state)) || '';

  const interpolateObjectVariables = (
    obj: Record<string, string>,
    variables: Variable[]
  ): Record<string, string> => {
    const result: Record<string, string> = {};
    Object.entries(obj).forEach(([key, value]) => {
      result[key] = interpolateVariables(value, variables);
    });
    return result;
  };

  const execute = useCallback(
    async (request: RequestData) => {
      setIsLoading(true);
      setError(undefined);
      setResponse(undefined);

      try {
        const interpolatedRequest = {
          method: request.method,
          url: interpolateVariables(request.url, variables),
          headers: interpolateObjectVariables(request.headers, variables),
          body: interpolateVariables(request.body, variables),
        };

        const data = await executeRequest(interpolatedRequest);
        const result = data.response;

        await saveRequest(userId, data.analytics);

        if (result.status >= 400 || result.status === 0) {
          const errorMessage =
            result.status === 0
              ? `Network Error: ${result.body}`
              : `HTTP ${result.status}: ${result.statusText || 'Request failed'}`;

          setError(errorMessage);
          onError?.(errorMessage);
        } else {
          setResponse(result);
          onSuccess?.(result);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        onError?.(errorMessage);

        return {
          status: 0,
          statusText: 'Exception',
          headers: {},
          body: errorMessage,
          time: 0,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [variables, onSuccess, onError, userId]
  );

  return { response, isLoading, error, execute };
};
