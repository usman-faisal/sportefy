import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ApiError {
  success: false;
  message: string;
  statusCode?: number;
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T> | null> {
  const defaultHeaders = {
    "Content-Type": "application/json",
    credentials: "include",
  };

  let cookieHeader = {};
  try {
    const cookieStore = await cookies();
    cookieHeader = { Cookie: cookieStore.toString() };
  } catch (error) {
    options.credentials = "include";
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...cookieHeader,
      ...options.headers,
    },
  };

  const url = `${API_BASE_URL}${path}`;
  try {
    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      console.error("API Error:", response.status, response.statusText);

      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData: ApiError = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {}

      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null;
    }

    const result: ApiResponse<T> = await response.json();
    return result;
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
}

// Dedicated function for paginated API calls
export async function apiPaginated<T = unknown>(
  path: string,
  params?: {
    page?: number;
    limit?: number;
    [key: string]: any;
  },
  options: RequestInit = {}
): Promise<PaginatedResponse<T> | null> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
  }

  const pathWithParams = searchParams.toString()
    ? `${path}?${searchParams.toString()}`
    : path;

  const response = await api<PaginatedResponse<T>>(pathWithParams, options);
  return response?.data || null;
}
