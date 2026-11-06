import express from "express";
import cors from "cors";
import { redis, redisConfigured } from "./redis.js";
import moviesRouter from "./routes/movies.js";
import authRouter from "./routes/auth.js";

const app = express();
// TODO 1: port와 clientOrigin을 환경 변수에서 읽습니다.
// TODO 2: clientOrigin을 CORS 허용 출처로 사용합니다.
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/movies", moviesRouter);

app.get("/", (req, res) => {
  res.json({ message: "영화 API 서버입니다." });
});

app.use((req, res) => {
  res.status(404).json({ message: "요청한 API를 찾을 수 없습니다." });
});

async function startServer() {
  if (redisConfigured) {
    try {
      await redis.connect();
      console.log("Redis 연결 완료");
    } catch (error) {
      console.error("Redis 연결 실패:", error.message);
    }
  } else {
    console.log("Redis 미설정: DB 조회로 진행합니다.");
  }

  // TODO 3: port와 0.0.0.0으로 요청을 받고 실제 포트를 출력합니다.
  app.listen(4000, () => {
    console.log("서버 실행: http://localhost:4000");
  });
}

startServer();
