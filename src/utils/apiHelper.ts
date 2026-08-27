import axios from "axios";
import { storage, setSession } from "./jwt";

const API_URL =
  import.meta.env.VITE_API_URL ||
  // "http://31.97.237.210/krushimall-api/api";
"http://localhost:5001/api";
const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

// Automatically attach token
api.interceptors.request.use((config) => {
  const token = storage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 401 / 403 handling
api.interceptors.response.use(
  (response) => {
    if (
      response.data?.status === 401 ||
      response.data?.status === 403
    ) {
      Logout();
    }

    return response;
  },
  (error) => {
    if (
      error.response?.status === 401 ||
      error.response?.status === 403
    ) {
      Logout();
    }

    return Promise.reject(error);
  },
);

// Logout
const Logout = () => {
  setSession(null);

  window.dispatchEvent(new Event("force-logout"));

  window.location.href = "/krushimall-admin/login";
};

// Base URL without /api
export const getBaseUrl = () => {
  return API_URL.replace(/\/api\/?$/, "");
};

const apiHelper = {
  // Image URL helper
  getImageUrl: (
    imagePath: string | null | undefined,
  ): string => {
    if (!imagePath) return "";

    // Full URL or base64
    if (
      imagePath.startsWith("http") ||
      imagePath.startsWith("data:")
    ) {
      return imagePath;
    }

    // Leading slash
    if (imagePath.startsWith("/")) {
      return `${getBaseUrl()}${imagePath}`;
    }

    // Filename only
    return `${getBaseUrl()}/uploads/${imagePath}`;
  },

  // GET
  get: async (
    url: string,
    params?: Record<string, any>,
  ) => {
    const response = await api.get(url, { params });
    return response.data;
  },

  // GET Blob
  getBlob: async (
    url: string,
    params?: Record<string, any>,
  ) => {
    const response = await api.get(url, {
      params,
      responseType: "blob",
    });

    return response.data;
  },

  // POST
  post: async (
    url: string,
    data?: Record<string, any>,
  ) => {
    const response = await api.post(url, data);
    return response.data;
  },

  // PUT
  put: async (
    url: string,
    data: any,
    config?: any,
  ) => {
    const response = await api.put(url, data, config);
    return response.data;
  },

  // PATCH
  patch: async (
    url: string,
    data?: Record<string, any>,
  ) => {
    const response = await api.patch(url, data);
    return response.data;
  },

  // DELETE
  delete: async (url: string) => {
    const response = await api.delete(url);
    return response.data;
  },

  // Upload
  upload: async (
    url: string,
    formData: FormData,
  ) => {
    const response = await api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};

export default apiHelper;