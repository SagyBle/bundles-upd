export default class ApiService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(baseUrl: string, headers: HeadersInit = {}) {
    this.baseUrl = baseUrl;
    this.headers = {
      "Content-Type": "application/json",
      ...headers,
    };
  }

  async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key]),
    );

    return this.request<T>(url.toString(), "GET");
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    console.log("sagy21", `${this.baseUrl}${endpoint}`, "POST", body);

    return this.request<T>(`${this.baseUrl}${endpoint}`, "POST", body);
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    console.log(`sagy28 ${this.baseUrl}${endpoint}`);

    return this.request<T>(`${this.baseUrl}${endpoint}`, "PUT", body);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(`${this.baseUrl}${endpoint}`, "DELETE");
  }

  async graphql<T>(query: string, variables?: Record<string, any>): Promise<T> {
    return this.request<T>(`${this.baseUrl}`, "POST", {
      query,
      variables,
    });
  }

  private async request<T>(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: any,
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        method,
        headers: this.headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status} - ${response.statusText}`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error("API Request Failed:", error);
      throw new Error("API request failed. See console for details.");
    }
  }
}
