import axios, {
  KEY_ACCESS_TOKEN,
  KEY_REFRESH_TOKEN,
  refreshTokenReq,
} from "./utils/request2";

function App() {
  const login = async () => {
    const res = await axios.post("/user/login", {
      username: "zhangsan",
      password: "123456",
    });
    console.log(res);

    localStorage.setItem(KEY_ACCESS_TOKEN, res.data.accessToken);
    localStorage.setItem(KEY_REFRESH_TOKEN, res.data.refreshToken);
  };

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button onClick={login}>登录</button>
      <button
        onClick={() => {
          axios.get("/bbb").then((res) => {
            console.log("bbb", res);
          });
        }}
      >
        限制访问
      </button>
      <button
        onClick={() => {
          refreshTokenReq();
        }}
      >
        刷新token
      </button>
    </div>
  );
}

export default App;
