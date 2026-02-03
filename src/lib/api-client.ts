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

  // Recuperar token para compatibilidad con el backend original (restaurado)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config: RequestInit = {
    method: options.method || (options.body ? "POST" : "GET"),
    ...customConfig,
    credentials: "include", // Mantener cookies para el backend con soporte de cookies
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  const response = await fetch(url.toString(), config);

  if (response.status === 401 && typeof window !== "undefined") {
    const isAdmin = window.location.pathname.startsWith("/admin");
    const loginPath = isAdmin ? "/admin/auth/login" : "/login";
    
    // Evitar loop si ya estamos en login
    if (!window.location.pathname.includes(loginPath)) {
      // localStorage.removeItem("token"); // Opcional: limpiar token corrupto
      window.location.href = loginPath;
    }
  }

  let data: any = null;
  const contentType = response.headers.get("content-type");
  
  if (response.status !== 204 && contentType && contentType.includes("application/json")) {
    const text = await response.text();
    if (text) {
      data = JSON.parse(text);
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || "Error en la petición a la API");
  }

  return data;
};
