const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export const apiClient = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { params, headers, ...customConfig } = options;
  
  const url = new URL(`${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`);
  
  if (params) {
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config: RequestInit = {
    method: options.method || (options.body ? "POST" : "GET"),
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  const response = await fetch(url.toString(), config);

  if (response.status === 401 && typeof window !== "undefined") {
    // Optional: handle unauthorized access
    // localStorage.removeItem("token");
    // window.location.href = "/login";
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error en la petición a la API");
  }

  return data;
};
