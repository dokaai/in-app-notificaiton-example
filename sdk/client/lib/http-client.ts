import { ApiClientConfig, RequestOptions } from '@/shared/types';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class HttpClient {
  private readonly accessToken?: string;
  private readonly authToken?: string;
  private readonly fetcher: typeof fetch;
  private readonly defaultHeaders?: HeadersInit;

  constructor(config: ApiClientConfig = {}) {
    this.accessToken = config.accessToken;
    this.authToken = config.authToken;
    this.fetcher = config.fetch ?? globalThis.fetch.bind(globalThis);
    this.defaultHeaders = config.defaultHeaders;
  }

  private buildHeaders(headers?: HeadersInit): Headers {
    const merged = new Headers(this.defaultHeaders);

    if (this.accessToken) {
      merged.set('x-access-token', this.accessToken);
    }

    if (this.authToken) {
      merged.set('Authorization', `Bearer ${this.authToken}`);
    }

    merged.set('Content-Type', 'application/json');

    if (headers) {
      const requestHeaders = new Headers(headers);
      requestHeaders.forEach((value, key) => {
        merged.set(key, value);
      });
    }

    return merged;
  }

  async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const response = await this.fetcher(url, {
      ...options,
      method: 'GET',
      headers: this.buildHeaders(options.headers),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data as T;
  }

  async put<T>(url: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    const response = await this.fetcher(url, {
      ...options,
      method: 'PUT',
      headers: this.buildHeaders(options.headers),
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data as T;
  }

  async post<T>(url: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    const response = await this.fetcher(url, {
      ...options,
      method: 'POST',
      headers: this.buildHeaders(options.headers),
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data as T;
  }
}
