import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRrefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const getStoredAccessToken = () => localStorage.getItem("token");

api.interceptors.request.use(
  (config) => {
    const token = getStoredAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we don't have a config or it's not 401, just reject.
    if (!originalRequest || error?.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't try to refresh if the refresh endpoint itself returned 401
    if (originalRequest.url && originalRequest.url.includes("/auth/refresh")) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      return Promise.reject(error);
    }

    // Prevent infinite retry loop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      }).catch((e) => Promise.reject(e));
    }

    isRefreshing = true;

    try {
      // Try cookie-based refresh first; include stored refresh token as fallback.
      const fallbackRefreshToken = localStorage.getItem("refreshToken");
      const refreshRes = await api.post("/auth/refresh", { refreshToken: fallbackRefreshToken });
      const newAccessToken = refreshRes.data?.accessToken;
      const newRefreshToken = refreshRes.data?.refreshToken;

      if (!newAccessToken) {
        throw new Error("No accessToken returned from refresh");
      }

      // persist updated tokens where applicable
      localStorage.setItem("token", newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }
      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

      onRrefreshed(newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      // Optional: redirect handled by app
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

