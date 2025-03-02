import { login, bbb } from "./utils/interface";
import { refreshToken } from "./utils/refresh-token-request";

function App() {
  return (
    <div className="App">
      <h1>Hello World</h1>
      <div style={{ display: "flex", gap: 20 }}>
        <button onClick={login}>登录</button>
        <button onClick={bbb}>请求受保护接口</button>
        <button onClick={refreshToken}>刷新token</button>
      </div>
    </div>
  );
}

export default App;
