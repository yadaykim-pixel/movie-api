import { redis } from "./redis.js";

export async function invalidateMovieLists() {
  if (!redis.isReady) {
    console.warn("캐시 삭제 생략: Redis 연결을 확인해 주세요.");
    return;
  }

  try {
    let deletedCount = 0;

    for await (const keys of redis.scanIterator({
      MATCH: "movies:list:*",
      COUNT: 100,
    })) {
      for (const key of keys) {
        deletedCount += await redis.del(key);
      }
    }

    console.log("[CACHE 삭제]", deletedCount);
  } catch (error) {
    console.error("목록 캐시 삭제 실패:", error.message);
  }
}
