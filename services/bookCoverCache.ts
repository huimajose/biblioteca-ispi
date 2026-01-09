import redis  from "@/lib/redis";



const TTL = 60 * 60 * 24 * 14; // 14 dias



export async function getCachedCover(isbn: string) {
  const key = `book:cover:${isbn}`;
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function setCachedCover(
  isbn: string,
  data: { url: string; source: string }
) {
  const key = `book:cover:${isbn}`;
  await redis.set(key, JSON.stringify(data), "EX", TTL);
}