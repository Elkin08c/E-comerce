import { apiClient } from "../api-client";
import {
    GET_PROVINCES,
    GET_CITIES_BY_PROVINCE
} from "@/graphql/queries";
import {
    CREATE_PROVINCE,
    UPDATE_PROVINCE,
    REMOVE_PROVINCE,
    CREATE_CITY,
    UPDATE_CITY,
    REMOVE_CITY
} from "@/graphql/mutations";

// Note: Since we are using Apollo Client in some parts of the app but also a custom apiClient,
// I'll provide a way to interact via the custom apiClient which uses fetch and handles auth headers.
// However, the existing hooks use Apollo. For management, we can use either.
// To keep it simple and consistent with other services, I'll use the apiClient for management.

// We need to wrap GraphQL calls for apiClient
const GRAPHQL_URL = `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace('/api/v1', '')}/graphql`;

const graphqlRequest = async <T>(query: any, variables: any = {}) => {
    const { useAuthStore } = await import("@/store/auth");
    const accessToken = useAuthStore.getState().accessToken;

    const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
            query: query.loc.source.body,
            variables,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error ${response.status}`);
    }

    return response.json();
};

export interface Province {
    id: string;
    name: string;
    code?: string;
    cities?: City[];
}

export interface City {
    id: string;
    name: string;
    provinceId: string;
    isActive?: boolean;
}

export const locationService = {
    getProvinces: async () => {
        const response = await graphqlRequest<{ allLocalizations: Province[] }>(GET_PROVINCES);
        return response.data.allLocalizations;
    },

    getCitiesByProvince: async (provinceId: string) => {
        const response = await graphqlRequest<{ cityByProvince: City[] }>(GET_CITIES_BY_PROVINCE, { provinceId });
        return response.data.cityByProvince;
    },

    createProvince: async (name: string, code?: string) => {
        const response = await graphqlRequest<{ createProvince: Province }>(CREATE_PROVINCE, {
            input: { name, code }
        });
        return response.data.createProvince;
    },

    updateProvince: async (id: string, name: string, code?: string) => {
        const response = await graphqlRequest<{ updateProvince: Province }>(UPDATE_PROVINCE, {
            id,
            data: { name, code }
        });
        return response.data.updateProvince;
    },

    deleteProvince: async (id: string) => {
        const response = await graphqlRequest<{ removeProvince: { id: string } }>(REMOVE_PROVINCE, { id });
        return response.data.removeProvince;
    },

    createCity: async (name: string, provinceId: string) => {
        const response = await graphqlRequest<{ createCity: City }>(CREATE_CITY, {
            input: { name, provinceId }
        });
        return response.data.createCity;
    },

    updateCity: async (id: string, name: string, provinceId: string) => {
        const response = await graphqlRequest<{ updateCity: City }>(UPDATE_CITY, {
            id,
            data: { name, provinceId }
        });
        return response.data.updateCity;
    },

    deleteCity: async (id: string) => {
        const response = await graphqlRequest<{ removeCity: { id: string } }>(REMOVE_CITY, { id });
        return response.data.removeCity;
    }
};
