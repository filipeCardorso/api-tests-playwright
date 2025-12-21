import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * API Client wrapper for making HTTP requests with common configurations
 */
export class ApiClient {
  private request: APIRequestContext;
  private baseURL: string;
  private accessToken?: string;

  constructor(request: APIRequestContext, baseURL: string) {
    this.request = request;
    this.baseURL = baseURL;
  }

  /**
   * Set the access token for authenticated requests
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Clear the access token
   */
  clearAccessToken(): void {
    this.accessToken = undefined;
  }

  /**
   * Get default headers including authorization if token is set
   */
  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  /**
   * Make a GET request
   */
  async get<T>(
    endpoint: string,
    options?: {
      params?: Record<string, string | number>;
      headers?: Record<string, string>;
    }
  ): Promise<{ response: APIResponse; data: T }> {
    const url = new URL(endpoint, this.baseURL);

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await this.request.get(url.toString(), {
      headers: this.getHeaders(options?.headers),
    });

    const data = await response.json().catch(() => null);
    return { response, data };
  }

  /**
   * Make a POST request
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: { headers?: Record<string, string> }
  ): Promise<{ response: APIResponse; data: T }> {
    const response = await this.request.post(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders(options?.headers),
      data: body,
    });

    const data = await response.json().catch(() => null);
    return { response, data };
  }

  /**
   * Make a PUT request
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: { headers?: Record<string, string> }
  ): Promise<{ response: APIResponse; data: T }> {
    const response = await this.request.put(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders(options?.headers),
      data: body,
    });

    const data = await response.json().catch(() => null);
    return { response, data };
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(
    endpoint: string,
    options?: { headers?: Record<string, string> }
  ): Promise<{ response: APIResponse; data: T }> {
    const response = await this.request.delete(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders(options?.headers),
    });

    const data = await response.json().catch(() => null);
    return { response, data };
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: { headers?: Record<string, string> }
  ): Promise<{ response: APIResponse; data: T }> {
    const response = await this.request.patch(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders(options?.headers),
      data: body,
    });

    const data = await response.json().catch(() => null);
    return { response, data };
  }
}
