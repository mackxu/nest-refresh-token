import axios, { AxiosError } from "axios";
import {
  isRefreshedToken,
  isRefreshTokenReq,
  refreshToken,
} from "./refresh-token-request";

export const KEY_ACCESS_TOKEN = "accessToken";
export const KEY_REFRESH_TOKEN = "refreshToken";

const instance = axios.create({
  baseURL: "http://localhost:3000",
});

instance.interceptors.request.use(
  (config) => {
    if (!config.url?.startsWith("/user")) {
      const token = localStorage.getItem(KEY_ACCESS_TOKEN);
      config.headers.Authorization = token ? `Bearer ${token}` : "";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (!error.response) {
      return Promise.reject(error);
    }
    const { config, status } = error.response;
    // 刷新token也失效时，跳转到登录页
    if (isRefreshTokenReq(config)) {
      console.log("go to login", error);
      return Promise.reject(error);
    }
    if (status === 401) {
      // 检查token是否被刷新过
      if (!isRefreshedToken(config)) {
        await refreshToken();
      }
      console.log("重新请求");
      return instance(config); // 重新发送请求
    }
    return Promise.reject(error);
  }
);

export default instance;
