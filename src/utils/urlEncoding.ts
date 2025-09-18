export interface RequestData {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}

const encodeUnicode = (str: string): string => {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
};

const decodeUnicode = (str: string): string => {
  return decodeURIComponent(
    Array.from(atob(str), (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')
  );
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
        queryParams.append(key.trim(), value.trim());
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
          headers[key] = value;
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
    const decoded = atob(str);
    return decoded.length > 0;
  } catch (_error) {
    return false;
  }
};

export const decodeUnicodeFromBase64 = (str: string): string => {
  try {
    return decodeURIComponent(
      Array.from(atob(str), (c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
  } catch (error) {
    console.error('Error decoding Unicode:', error);
    return '';
  }
};

export const getCurrentUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.pathname + window.location.search;
  }
  return '';
};
