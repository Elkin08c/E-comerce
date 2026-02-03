import { apiClient } from "../api-client";

export interface PayphoneInitData {
  orderId: string;
  amount: number;
  tax: number;
  service?: number;
}

export interface PayphoneInitResponse {
  amount: number;
  tax: number;
  amountWithoutTax: number;
  clientTransactionID: string;
  responseUrl: string;
  cancellationUrl: string;
}

export interface DeunaInitData {
  orderId: string;
  amount: number;
}

export interface DeunaInitResponse {
  orderToken: string;
  checkoutUrl: string;
}

export const paymentProvidersService = {
  initializePayphone: async (data: PayphoneInitData): Promise<PayphoneInitResponse> => {
    return apiClient("/payments/payphone/initialize", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  initializeDeuna: async (data: DeunaInitData): Promise<DeunaInitResponse> => {
    return apiClient("/payments/deuna/initialize", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  verifyPayment: async (paymentId: string, data: any): Promise<any> => {
    return apiClient(`/payments/${paymentId}/verify`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  uploadProof: async (paymentId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient(`/payments/${paymentId}/upload-proof`, {
      method: "POST",
      body: formData,
      headers: {
        // apiClient will handle content-type if we don't set it for FormData
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
