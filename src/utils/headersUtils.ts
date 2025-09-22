export interface Header {
  key: string;
  value: string;
}

export const headersArrayToObject = (
  headers: Header[]
): Record<string, string> => {
  const result: Record<string, string> = {};
  headers.forEach(({ key, value }) => {
    if (key.trim()) {
      result[key.trim()] = value;
    }
  });
  return result;
};

export const headersObjectToArray = (
  headersObj: Record<string, string>
): Header[] => {
  return Object.entries(headersObj).map(([key, value]) => ({
    key,
    value,
  }));
};

export const headersArrayToString = (headers: Header[]): string => {
  return JSON.stringify(headersArrayToObject(headers), null, 2);
};

export const headersStringToArray = (headersString: string): Header[] => {
  try {
    const headersObj = JSON.parse(headersString || '{}');
    return headersObjectToArray(headersObj);
  } catch {
    return [];
  }
};
