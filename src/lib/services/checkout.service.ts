import { apiClient } from "../api-client";

export interface CheckoutInput {
  cartId: string;
  addressId: string;
  paymentMethodType: string;
  paymentMethodId?: string;
  shippingMethodId: string;
  shippingMethodType: string;
  zoneId: string;
  couponCodes?: string[];
  referralCodeId?: string;
  notes?: string;
}

export const checkoutService = {
  validate: async (input: { cartId: string; addressId: string; zoneId: string; couponCodes?: string[] }): Promise<any> => {
    return apiClient("/checkout/validate", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  calculateTotals: async (input: any): Promise<any> => {
    return apiClient("/checkout/calculate-totals", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  initiate: async (input: CheckoutInput): Promise<any> => {
    return apiClient("/checkout/initiate", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  getSummary: async (params: Record<string, string>): Promise<any> => {
    return apiClient("/checkout/summary", { params });
  }
};
