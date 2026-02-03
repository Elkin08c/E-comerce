import { apiClient } from "../api-client";

export interface CustomerLoginResponse {
  accessToken: string;
  refreshToken: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export const customerAuthService = {
  login: async (credentials: Record<string, string>): Promise<CustomerLoginResponse> => {
    return apiClient<CustomerLoginResponse>("/customer/auth/login", {
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
  },

  logout: async (): Promise<void> => {
    return apiClient("/customer/auth/logout", {
      method: "POST",
    });
  },

  refreshToken: async (): Promise<any> => {
    return apiClient("/customer/auth/refresh-token", {
      method: "POST",
    });
  }
};
