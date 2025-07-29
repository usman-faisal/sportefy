import { cookies } from "next/headers";

export async function fetchWithCookies(url: string, options: RequestInit = {}) {
  const cookieStore = cookies();

  const defaultHeaders = {
    Cookie: cookieStore.toString(),
    "Content-Type": "application/json",
  };

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  return fetch(url, mergedOptions);
}

// Usage in server components
const data = await fetchWithCookies("/api/user-data").then((res) => res.json());
