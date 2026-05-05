export interface ApiClientConfig {
  accessToken?: string;
  orgId?: string;
  fetch?: typeof fetch;
  defaultHeaders?: HeadersInit;
}

export interface RequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: HeadersInit;
}

export interface PaginatedRequest {
  page?: number;
  size?: number;
}
