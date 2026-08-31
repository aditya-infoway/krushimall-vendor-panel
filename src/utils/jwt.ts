import { Capacitor } from "@capacitor/core";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "@/utils/axios";

const storage = Capacitor.isNativePlatform() ? localStorage : localStorage;

const LOGIN_PATH = "/login"; // apne actual vendor panel route se replace kar de

interface TokenPayload {
  vendorId: number;
  userId: number;
  email: string;
  role: "vendor";
  exp?: number;
}

const isTokenValid = (authToken: string): boolean => {
  try {
    const decoded: TokenPayload = jwtDecode(authToken);

    if (!decoded.exp) {
      console.error("Token does not contain an expiration time.");
      return false;
    }

    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (err) {
    console.error("Failed to decode token:", err);
    return false;
  }
};

const decodeToken = (authToken: string): TokenPayload | null => {
  try {
    return jwtDecode<TokenPayload>(authToken);
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
};

const setSession = (authToken?: string | null): void => {
  if (typeof authToken === "string" && authToken.trim() !== "") {
    storage.setItem("authToken", authToken);

    axiosInstance.defaults.headers.common.Authorization = `Bearer ${authToken}`;
  } else {
    storage.removeItem("authToken");

    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

// Check token before request
axiosInstance.interceptors.request.use((config) => {
  const authToken = storage.getItem("authToken");

  if (authToken && !isTokenValid(authToken)) {
    storage.removeItem("authToken");

    delete axiosInstance.defaults.headers.common.Authorization;

    window.location.href = LOGIN_PATH;

    return Promise.reject(new Error("Session expired"));
  }

  return config;
});

// Handle 401
axiosInstance.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      setSession(null);

      window.location.href = LOGIN_PATH;
    }

    return Promise.reject(error);
  },
);

export { isTokenValid, decodeToken, setSession, storage, LOGIN_PATH };