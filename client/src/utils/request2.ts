import axios, { AxiosError, AxiosResponse } from "axios";

export const KEY_ACCESS_TOKEN = "access_token";
export const KEY_REFRESH_TOKEN = "refresh_token";

let refreshTokenPromise: Promise<AxiosResponse> | null = null;

export const refreshTokenReq = async () => {
  const token = localStorage.getItem(KEY_REFRESH_TOKEN);
  if (!token) {
    return Promise.reject("no refresh token");
  }
  refreshTokenPromise = instance.get(`/user/refresh_token?token=${token}`);
  try {
    const resp = await refreshTokenPromise;
    const { accessToken, refreshToken } = resp.data;
    localStorage.setItem(KEY_ACCESS_TOKEN, accessToken);
    localStorage.setItem(KEY_REFRESH_TOKEN, refreshToken);
    refreshTokenPromise = null;
  } catch (error) {
    refreshTokenPromise = null;
    localStorage.removeItem(KEY_ACCESS_TOKEN);
    localStorage.removeItem(KEY_REFRESH_TOKEN);
  }
};

const instance = axios.create({
  baseURL: "http://localhost:3000",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem(KEY_ACCESS_TOKEN);
  if (config.url?.startsWith("/user") || !token) {
    return config;
  }
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response) {
      const { status, config } = error.response;
      const isRefreshUrl = config.url?.startsWith("/user/refresh_token?token=");
      if (status === 401 && !isRefreshUrl) {
        try {
          if (!refreshTokenPromise) {
            refreshTokenReq();
          }
          await refreshTokenPromise;
          return instance(config);
        } catch (err) {
          console.log(err);
          return Promise.reject(error);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
