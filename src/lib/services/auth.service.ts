import { apiClient } from "../api-client";

export interface UserLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  login: async (credentials: Record<string, string>): Promise<UserLoginResponse> => {
    return apiClient<UserLoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  logout: async (): Promise<void> => {
    return apiClient("/auth/logout", {
      method: "POST",
    });
  },

  refreshToken: async (): Promise<any> => {
    return apiClient("/auth/refresh-token", {
      method: "POST",
    });
  }
};
