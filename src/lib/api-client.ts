import { useAuthStore } from "@/store/auth";

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

  // Obtener el token del store de autenticación
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken && !endpoint.includes("/auth/")) {
    console.warn(`[apiClient] No accessToken found for request to ${endpoint}`);
  }

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
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

  try {
    const response = await fetch(url.toString(), config);

    // En caso de 401, limpiar el estado de auth y dejar que el layout guard maneje la redirección
    if (response.status === 401 && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath.includes("/auth/login") || currentPath === "/login";

      if (!isLoginPage) {
        useAuthStore.getState().logout();
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
      const errorMessage = data?.message || data?.error || `Error ${response.status}: ${response.statusText}`;
      console.error(`API Error [${endpoint}]:`, errorMessage);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Si es un error de red o fetch
    if (error instanceof TypeError) {
      console.error(`Network Error [${endpoint}]:`, error.message);
      throw new Error("Error de conexión con el servidor. Verifica que el backend esté corriendo.");
    }
    // Re-lanzar otros errores
    throw error;
  }
};
