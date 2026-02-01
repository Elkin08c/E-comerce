import { apiClient } from "../api-client";

export interface LoginResponse {
  accessToken: string;
  token?: string;
  access_token?: string;
  customer?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export const authService = {
  login: async (credentials: Record<string, string>): Promise<LoginResponse> => {
    return apiClient<LoginResponse>("/customer/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },
  
  register: async (data: Record<string, any>): Promise<any> => {
    return apiClient("/customer/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getProfile: async (): Promise<any> => {
    return apiClient("/customer/auth/profile");
  }
};
