export interface RequestData {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}

const encodeUnicode = (str: string): string => {
  try {
    if (!str) return '';

    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  } catch (error) {
    console.error('Error encoding Unicode:', error);
    return btoa(encodeURIComponent(''));
  }
};

const decodeUnicode = (str: string): string => {
  try {
    if (!str) return '';

    const decoded = atob(str);
    return decodeURIComponent(
      Array.from(decoded, (c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
  } catch (error) {
    console.error('Error decoding Unicode:', error);
    return '';
  }
};

export const encodeRequestToUrl = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  locale: string = 'en'
): string => {
  try {
    if (!url.trim()) {
      return `/${locale}/rest-client/${method}`;
    }

    const encodedUrl = encodeUnicode(url.trim());
    const encodedBody = body.trim() ? encodeUnicode(body.trim()) : '';

    let path = `/${locale}/rest-client/${method}`;
    if (encodedUrl) {
      path += `/${encodedUrl}`;
    }
    if (encodedBody) {
      path += `/${encodedBody}`;
    }

    const queryParams = new URLSearchParams();
    Object.entries(headers || {}).forEach(([key, value]) => {
      if (key && value && key.trim() && value.trim()) {
        const encodedValue = encodeUnicode(value.trim());
        queryParams.append(key.trim(), encodedValue);
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `${path}?${queryString}` : path;
  } catch (error) {
    console.error('Error encoding URL:', error);
    return `/${locale}/rest-client/${method}`;
  }
};

export const decodeRequestFromUrl = (
  pathname: string | null,
  searchParams: URLSearchParams | null
): RequestData | null => {
  if (!pathname || !pathname.includes('/rest-client/')) {
    return null;
  }

  const pathParts = pathname.split('/').filter((part) => part !== '');

  const restClientIndex = pathParts.findIndex((part) => part === 'rest-client');

  if (restClientIndex === -1 || pathParts.length < restClientIndex + 2) {
    return null;
  }

  const method = pathParts[restClientIndex + 1];
  const encodedUrl = pathParts[restClientIndex + 2];
  const encodedBody = pathParts[restClientIndex + 3] || '';

  try {
    const url = encodedUrl ? decodeUnicode(encodedUrl) : '';
    const body = encodedBody ? decodeUnicode(encodedBody) : '';

    const headers: Record<string, string> = {};
    if (searchParams) {
      searchParams.forEach((value, key) => {
        if (key && value) {
          try {
            headers[key] = decodeUnicode(value);
          } catch (error) {
            console.error(`Error decoding header ${key}:`, error);
            headers[key] = value;
          }
        }
      });
    }

    return { method, url, headers, body };
  } catch (error) {
    console.error('Error decoding URL:', error);
    return null;
  }
};

export const isValidBase64 = (str: string): boolean => {
  try {
    if (!str) return false;

    if (str.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(str)) {
      return false;
    }

    const decoded = atob(str);
    return decoded.length > 0;
  } catch (_error) {
    return false;
  }
};

export const decodeUnicodeFromBase64 = (str: string): string => {
  try {
    if (!str || !isValidBase64(str)) {
      return '';
    }

    const decoded = atob(str);
    return decodeURIComponent(
      Array.from(decoded, (c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
  } catch (error) {
    console.error('Error decoding Unicode from Base64:', error);
    return '';
  }
};

export const getCurrentUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.pathname + window.location.search;
  }
  return '';
};

export const encodeRequestToSearchParams = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): URLSearchParams => {
  const params = new URLSearchParams();

  params.set('method', method);
  if (url) params.set('url', encodeUnicode(url.trim()));
  if (body.trim()) params.set('body', encodeUnicode(body.trim()));

  Object.entries(headers || {}).forEach(([key, value]) => {
    if (key && value && key.trim() && value.trim()) {
      params.set(key.trim(), encodeUnicode(value.trim()));
    }
  });

  return params;
};

export const decodeRequestFromSearchParams = (
  searchParams: URLSearchParams
): RequestData => {
  const method = searchParams.get('method') || 'GET';
  const encodedUrl = searchParams.get('url');
  const encodedBody = searchParams.get('body');

  let url = '';
  let body = '';
  const headers: Record<string, string> = {};

  if (encodedUrl) {
    try {
      url = decodeUnicode(encodedUrl);
    } catch (error) {
      console.error('Error decoding URL:', error);
    }
  }

  if (encodedBody) {
    try {
      body = decodeUnicode(encodedBody);
    } catch (error) {
      console.error('Error decoding body:', error);
    }
  }

  searchParams.forEach((value, key) => {
    if (key !== 'method' && key !== 'url' && key !== 'body' && value) {
      try {
        headers[key] = decodeUnicode(value);
      } catch (error) {
        console.error(`Error decoding header ${key}:`, error);
        headers[key] = value;
      }
    }
  });

  return {
    method,
    url,
    headers,
    body,
  };
};

export const createRestClientUrl = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  locale: string = 'en'
): string => {
  const params = encodeRequestToSearchParams(method, url, headers, body);
  return `/${locale}/rest-client?${params.toString()}`;
};

export const safeEncodeURIComponent = (str: string): string => {
  try {
    return encodeURIComponent(str);
  } catch (error) {
    console.error('Error encoding URI component:', error);
    return '';
  }
};

export const safeDecodeURIComponent = (str: string): string => {
  try {
    return decodeURIComponent(str);
  } catch (error) {
    console.error('Error decoding URI component:', error);
    return str;
  }
};

export const isUrlEncoded = (str: string): boolean => {
  try {
    return str !== decodeURIComponent(str);
  } catch {
    return false;
  }
};

export const normalizeUrl = (url: string): string => {
  try {
    if (!url) return '';

    let normalizedUrl = url.trim();

    if (
      !normalizedUrl.startsWith('http://') &&
      !normalizedUrl.startsWith('https://')
    ) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    return normalizedUrl;
  } catch (error) {
    console.error('Error normalizing URL:', error);
    return url;
  }
};
