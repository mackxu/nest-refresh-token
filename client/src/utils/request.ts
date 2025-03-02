import axios, { AxiosError, AxiosRequestConfig } from "axios";

type PendingTask = {
  config: AxiosRequestConfig;
  resolve: (value: unknown) => void;
  reject: () => void;
};

export const KEY_ACCESS_TOKEN = "accessToken";
export const KEY_REFRESH_TOKEN = "refreshToken";

let isRefreshing = false;
let pendingTasks: PendingTask[] = [];

axios.defaults.baseURL = "http://localhost:3000";

const sleep = (ttl = 2000) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ttl);
  });
};

const refreshToken = async () => {
  const refreshToken = localStorage.getItem(KEY_REFRESH_TOKEN);
  if (!refreshToken) {
    return Promise.reject("No refresh token");
  }
  // await sleep();
  const res = await axios.get(`/user/refresh_token?token=${refreshToken}`);
  localStorage.setItem(KEY_ACCESS_TOKEN, res.data.accessToken);
  localStorage.setItem(KEY_REFRESH_TOKEN, res.data.refreshToken);
  return res;
};

const handleResponse401Error = async (error: AxiosError) => {
  const { config } = error.response!;
  // 缓存401的请求，等待 token 刷新成功后再发起请求
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      pendingTasks.push({
        config,
        resolve,
        reject,
      });
    });
  }
  isRefreshing = true;
  try {
    const res = await refreshToken();
    isRefreshing = false;
    if (res.status !== 200) {
      throw new Error("Refresh token failed");
    }
    console.log("refresh success", pendingTasks.length);
    // token 刷新成功，重新发起请求
    pendingTasks.forEach((task) => {
      task.resolve(axios(task.config));
    });
    pendingTasks = [];
    // 第一个遇到401错误的请求
    return axios(config);
  } catch (err) {
    isRefreshing = false;
    pendingTasks.forEach((task) => {
      task.reject();
    });
    pendingTasks = [];
    return Promise.reject(error);
  }
};

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem(KEY_ACCESS_TOKEN);
  if (config.url?.startsWith("/user") || !token) {
    return config;
  }
  // 非登陆接口，携带token
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status, config } = error.response;
      const isRefreshUrl = config.url?.startsWith("/user/refresh_token?token=");

      if (status === 401 && !isRefreshUrl) {
        return handleResponse401Error(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
