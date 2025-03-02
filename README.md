# 无感刷新 token

## 重点代码

判断是不是刷新 token 请求

```ts
export function isRefreshTokenReq(config: AxiosResponse["config"]) {
  return !!config.url?.startsWith("/user/refresh_token");
}
```

请求带的 token 和当前的 token 是否一致  
不相同的，说明 token 被刷新过。  
用于判断那些请求：  
在`刷新token`过程中发送，而又在`刷新token` 之后返回的 401 状态的请求。

```ts
export function isRefreshedToken(config: AxiosResponse["config"]) {
  const token = localStorage.getItem(KEY_ACCESS_TOKEN) || "";
  return token !== config.headers.Authorization?.substring(7);
}
```

## 测试

### 服务器

```bash
# 启动服务器
cd backend
npm run start:dev
```

access_token 有效期 10 秒  
refresh_token 有效期 120 秒

### 客户端

```bash
cd client2
# 启动客户端
npm run dev
```
