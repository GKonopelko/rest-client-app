interface RequestData {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}

function isValidBase64(str: string): boolean {
  const base64Regex =
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  return base64Regex.test(str);
}

export function encodeRequestToUrl(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): string {
  try {
    const requestData = { method, url, headers, body };
    const jsonString = JSON.stringify(requestData);
    const base64String = btoa(unescape(encodeURIComponent(jsonString)));
    return `/rest-client?data=${base64String}`;
  } catch (error) {
    console.error('Error encoding request to URL:', error);
    return '/rest-client';
  }
}

export function decodeRequestFromUrl(
  searchParams: URLSearchParams
): RequestData | null {
  try {
    const data = searchParams.get('data');

    if (!data) {
      console.warn("No 'data' parameter found in URL.");
      return null;
    }

    if (!isValidBase64(data)) {
      console.error('Invalid Base64 string found:', data);
      return null;
    }

    try {
      const decodedString = atob(data);
      const json = JSON.parse(decodedString) as RequestData;
      return json;
    } catch (base64Error) {
      console.error('Error decoding Base64 string:', base64Error);
      return null;
    }
  } catch (error) {
    console.error('Error decoding URL:', error);
    return null;
  }
}

export function headersObjectToString(headers: Record<string, string>): string {
  try {
    return JSON.stringify(headers, null, 2);
  } catch {
    return '{}';
  }
}

export function headersStringToObject(
  headersString: string
): Record<string, string> {
  try {
    return JSON.parse(headersString || '{}');
  } catch {
    return {};
  }
}
