export interface RequestData {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}

export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
}

export interface RestClientState {
  request: RequestData;
  response?: ResponseData;
  isLoading: boolean;
  error?: string;
}

export interface Header {
  key: string;
  value: string;
}
