import { cookies } from "next/headers";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders() {
    const cookieStore = cookies();
    return {
      "Content-Type": "application/json",
      Cookie: cookieStore.toString(),
    };
  }

  async get(endpoint: string) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers,
      cache: "no-store", // or appropriate caching strategy
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  }

  async post(endpoint: string, data: any) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    return response.json();
  }
}

export const apiClient = new ApiClient(process.env.API_BASE_URL || "");
