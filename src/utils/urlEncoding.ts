export interface RequestData {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}

export const encodeRequestToUrl = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): string => {
  try {
    const encodedUrl = btoa(encodeURIComponent(url || ''));
    const encodedBody = body ? btoa(encodeURIComponent(body)) : '';

    let path = `/rest-client/${method}/${encodedUrl}`;
    if (encodedBody) {
      path += `/${encodedBody}`;
    }

    const queryParams = new URLSearchParams();
    Object.entries(headers || {}).forEach(([key, value]) => {
      if (key && value && key !== 'Content-Type') {
        queryParams.append(key, encodeURIComponent(value));
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `${path}?${queryString}` : path;
  } catch (error) {
    console.error('Error encoding URL:', error);
    return `/rest-client/${method}`;
  }
};

export const decodeRequestFromUrl = (
  pathname: string | null,
  searchParams: URLSearchParams | null
): RequestData | null => {
  if (!pathname || !pathname.includes('/rest-client/')) {
    return null;
  }

  const pathParts = pathname.split('/');
  const restClientIndex = pathParts.findIndex((part) => part === 'rest-client');

  if (restClientIndex === -1 || pathParts.length < restClientIndex + 3) {
    return null;
  }

  const method = pathParts[restClientIndex + 1];
  const encodedUrl = pathParts[restClientIndex + 2];
  const encodedBody = pathParts[restClientIndex + 3] || '';

  try {
    const url = encodedUrl ? decodeURIComponent(atob(encodedUrl)) : '';
    const body = encodedBody ? decodeURIComponent(atob(encodedBody)) : '';

    const headers: Record<string, string> = {};
    if (searchParams) {
      searchParams.forEach((value, key) => {
        headers[key] = decodeURIComponent(value);
      });
    }

    return { method, url, headers, body };
  } catch (error) {
    console.error('Error decoding URL:', error);
    return { method, url: '', headers: {}, body: '' };
  }
};

export const headersObjectToString = (
  headers: Record<string, string>
): string => {
  return JSON.stringify(headers, null, 2);
};

export const headersStringToObject = (
  headersString: string
): Record<string, string> => {
  try {
    return JSON.parse(headersString || '{}');
  } catch {
    return {};
  }
};
