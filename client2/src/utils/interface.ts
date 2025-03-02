import axios, { KEY_ACCESS_TOKEN, KEY_REFRESH_TOKEN } from "./request";

export async function login() {
  const resp = await axios.post("/user/login", {
    username: "zhangsan",
    password: "123456",
  });

  localStorage.setItem(KEY_ACCESS_TOKEN, resp.data.accessToken);
  localStorage.setItem(KEY_REFRESH_TOKEN, resp.data.refreshToken);
  return resp.data;
}

export function bbb() {
  axios.get("/bbb").then((res) => {
    console.log(res);
  });
}
