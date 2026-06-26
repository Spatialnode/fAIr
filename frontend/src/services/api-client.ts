import Axios, { InternalAxiosRequestConfig } from "axios";
import {
  BASE_API_URL,
  HOT_FAIR_LOCAL_STORAGE_ACCESS_TOKEN_KEY,
  STAC_CATALOG_API_URL,
  NEW_BASE_API_URL,
} from "@/config";
import { showErrorToast } from "@/utils";

/**
 * The global axios API client.
 */
export const apiClient = Axios.create({
  baseURL: BASE_API_URL,
});

export const stacClient = Axios.create({
  baseURL: STAC_CATALOG_API_URL,
});

export const newApiClient = Axios.create({
  baseURL: NEW_BASE_API_URL,
});

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = "application/json";
  }
  return config;
}

/**
 * Interceptors
 */
apiClient.interceptors.request.use(authRequestInterceptor);
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // if unauthorized request, simply clear the local storage to log them out.
    if (!error.response) {
      showErrorToast(undefined, "Network error");
    }
    if (error.response?.status === 401) {
      showErrorToast(undefined, "Unauthorized, logging out...");
      localStorage.removeItem(HOT_FAIR_LOCAL_STORAGE_ACCESS_TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);

// TODO: Replace with proper token flow once auth is integrated for the new API.
const NEW_API_TEMP_TOKEN =
  "qeOlSYp0xMiSKqBwOOmgWNjg68R32NjyuG0m1kNEBCU9WJ_a3KlBElQ-7bFE5GuA";

function newApiAuthRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = "application/json";
    config.headers.Authorization = `Bearer ${NEW_API_TEMP_TOKEN}`;
  }
  return config;
}

/**
 * Interceptors
 */
newApiClient.interceptors.request.use(newApiAuthRequestInterceptor);
newApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // if unauthorized request, simply clear the local storage to log them out.
    if (!error.response) {
      showErrorToast(undefined, "Network error");
    }
    if (error.response?.status === 401) {
      showErrorToast(undefined, "Unauthorized, logging out...");
      localStorage.removeItem(HOT_FAIR_LOCAL_STORAGE_ACCESS_TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);
