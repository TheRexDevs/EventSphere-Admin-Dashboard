/**
 * API utility functions for making HTTP requests
 */

import { ApiErrorResponse } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public status: number;
  public errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Generic fetch wrapper with error handling
 */
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError("API URL not configured", 500);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  // Build headers: always send Accept json; only set Content-Type when sending JSON body
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (options.body && typeof options.body === "string") {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json; charset=utf-8";
  }

  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  const config: RequestInit = {
    ...options,
    headers,
    signal: controller.signal
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      // If response is not JSON, handle as text
      const text = await response.text();
      throw new ApiError(
        response.ok ? "Invalid response format" : text || "Request failed",
        response.status
      );
    }

    if (!response.ok) {
      const errorData = data as ApiErrorResponse;
      
      // Only auto-refresh on 401 if we have a token and it's not an auth endpoint
      const isAuthEndpoint = endpoint.includes("/api/v1/auth/");
      const hasToken = tokenManager.get();
      
      if (response.status === 401 && 
          hasToken && 
          !isAuthEndpoint && 
          !((config.headers as Record<string, string> | undefined)?.["X-Retry-After-Refresh"])) {
        try {
          const { refreshAccessToken } = await import("@/lib/api/auth");
          await refreshAccessToken();
          
          // Retry the request with new token
          const retryConfig = {
            ...config,
            headers: {
              ...(config.headers as Record<string, string>),
              ...tokenManager.getAuthHeader(),
              "X-Retry-After-Refresh": "true", // Prevent infinite retry
            },
          };
          
          return fetchApi<T>(endpoint, retryConfig);
        } catch {
          // Refresh failed, clear all auth data and throw original error
          tokenManager.remove();
          if (typeof document !== "undefined") {
            document.cookie = "access_token=; Path=/; Max-Age=0; SameSite=Lax";
          }
          if (typeof window !== "undefined") {
            try { 
              localStorage.removeItem("auth_user");
              localStorage.removeItem("access_token");
            } catch {}
          }
        }
      }
      
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.errors
      );
    }

    return data as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    // Handle timeout errors
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Request timeout - please try again", 408);
    }

    const message = error instanceof Error ? error.message : "Network error occurred";
    throw new ApiError(message, 0);
  }
}

/**
 * GET request helper
 */
export function apiGet<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: "GET",
    headers,
  });
}

/**
 * POST request helper
 */
export function apiPost<T, B = unknown>(
  endpoint: string,
  body?: B,
  headers?: Record<string, string>
): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    headers,
  });
}

/**
 * PUT request helper
 */
export function apiPut<T, B = unknown>(
  endpoint: string,
  body?: B,
  headers?: Record<string, string>
): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
    headers,
  });
}

/**
 * POST helper for FormData bodies (e.g., file uploads)
 * Does not set Content-Type so the browser can set the multipart boundary.
 */
export function apiPostForm<T>(
  endpoint: string,
  formData: FormData,
  headers?: Record<string, string>
): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: "POST",
    body: formData,
    headers,
  });
}

/**
 * PUT helper for FormData bodies (e.g., file uploads)
 * Does not set Content-Type so the browser can set the multipart boundary.
 */
export function apiPutForm<T>(
  endpoint: string,
  formData: FormData,
  headers?: Record<string, string>
): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: "PUT",
    body: formData,
    headers,
  });
}

/**
 * PATCH request helper
 */
export function apiPatch<T, B = unknown>(
  endpoint: string,
  body?: B,
  headers?: Record<string, string>
): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
    headers,
  });
}

/**
 * DELETE request helper
 */
export function apiDelete<T>(
  endpoint: string,
  headers?: Record<string, string>
): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: "DELETE",
    headers,
  });
}

/**
 * Token management utilities
 */
export const tokenManager = {
  get: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  },
  
  set: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("access_token", token);
  },
  
  remove: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("access_token");
  },
  
  getAuthHeader: (): Record<string, string> => {
    const token = tokenManager.get();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};
