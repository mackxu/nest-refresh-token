import { AxiosResponse } from "axios";
import request, { KEY_ACCESS_TOKEN, KEY_REFRESH_TOKEN } from "./request";

let refreshTokenPromise: Promise<any> | null = null;

export async function refreshToken() {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = new Promise(async (resolve, reject) => {
    console.log("refresh token");
    const token = localStorage.getItem(KEY_REFRESH_TOKEN);
    try {
      const resp = await request.get(`/user/refresh_token?token=${token}`);
      localStorage.setItem(KEY_ACCESS_TOKEN, resp.data.accessToken);
      localStorage.setItem(KEY_REFRESH_TOKEN, resp.data.refreshToken);
      resolve(resp.data);
      console.log("refresh token success");
    } catch (error) {
      reject(error);
    }
  });
  // refreshTokenPromise.then(() => {

  // })
  refreshTokenPromise.finally(() => {
    refreshTokenPromise = null;
  });
  return refreshTokenPromise;
}

export function isRefreshTokenReq(config: AxiosResponse["config"]) {
  return !!config.url?.startsWith("/user/refresh_token");
}

// 请求带的token和当前的token是否一致
// 不相同的，说明token被刷新过
export function isRefreshedToken(config: AxiosResponse["config"]) {
  const token = localStorage.getItem(KEY_ACCESS_TOKEN) || "";
  return token !== config.headers.Authorization?.substring(7);
}
