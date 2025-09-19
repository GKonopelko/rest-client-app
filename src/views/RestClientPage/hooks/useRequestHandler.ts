import { useState, useCallback } from 'react';
import { RequestData, ResponseData } from '../types';
import { executeRequest } from '@/utils/requestHelpers';
import { interpolateVariables } from '@/utils/variablesUtils';
import { Variable } from '@/utils/variablesUtils';

interface UseRequestHandlerProps {
  variables: Variable[];
}

export const useRequestHandler = ({ variables }: UseRequestHandlerProps) => {
  const [response, setResponse] = useState<ResponseData>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

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

      try {
        const interpolatedRequest = {
          method: request.method,
          url: interpolateVariables(request.url, variables),
          headers: interpolateObjectVariables(request.headers, variables),
          body: interpolateVariables(request.body, variables),
        };

        const result = await executeRequest(interpolatedRequest);

        if (result.status === 0) {
          throw new Error(result.body || 'Network connection failed');
        }

        setResponse(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [variables]
  );

  return { response, isLoading, error, execute };
};
