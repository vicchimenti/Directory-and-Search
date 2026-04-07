import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// 🔒 CONFIG — tune these once and forget
const ALLOWED_COLLECTIONS = ['seattleu~sp-search'];
const MAX_START_RANK = 100;
const MAX_NUM_RANKS = 50;
const MAX_QUERY_LENGTH = 100;

// simple helper
function badRequest(msg: string) {
  return new Response(msg, { status: 400 });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const params = url.searchParams;

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // -----------------------------
  // ✅ 1. Extract + validate params
  // -----------------------------
  const query = (params.get('query') || '').trim();
  const collection = params.get('collection') || '';
  const startRank = Number(params.get('start_rank') || 0);
  const numRanks = Number(params.get('num_ranks') || 10);

  if (!query) return badRequest('Missing query');
  if (query === '*' || query.length > MAX_QUERY_LENGTH) {
    return badRequest('Invalid query');
  }

  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return new Response('Invalid collection', { status: 403 });
  }

  // -----------------------------
  // ✅ 2. Clamp expensive params
  // -----------------------------
  const safeStart = Math.min(Math.max(startRank, 0), MAX_START_RANK);
  const safeNum = Math.min(Math.max(numRanks, 1), MAX_NUM_RANKS);

  // -----------------------------
  // ✅ 3. Normalize cache key
  // -----------------------------
  const normalizedKey = `q=${query.toLowerCase()}|c=${collection}|s=${safeStart}|n=${safeNum}`;

  // -----------------------------
  // ✅ 4. Rate limit (IP-based)
  // -----------------------------
  const ipKey = `rate:ip:${ip}`;
  const ipCount = await redis.incr(ipKey);

  if (ipCount === 1) {
    await redis.expire(ipKey, 60); // 1 min window
  }

  if (ipCount > 60) {
    return new Response('Too many requests', { status: 429 });
  }

  // -----------------------------
  // ✅ 5. Rate limit (query-based)
  // -----------------------------
  const queryKey = `rate:query:${normalizedKey}`;
  const queryCount = await redis.incr(queryKey);

  if (queryCount === 1) {
    await redis.expire(queryKey, 60);
  }

  if (queryCount > 30) {
    return new Response('Query rate exceeded', { status: 429 });
  }

  // -----------------------------
  // ✅ 6. Build safe Funnelback URL
  // -----------------------------
  const funnelbackUrl = new URL('https://YOUR_FUNNELBACK_ENDPOINT/search.json');

  funnelbackUrl.searchParams.set('query', query);
  funnelbackUrl.searchParams.set('collection', collection);
  funnelbackUrl.searchParams.set('start_rank', String(safeStart));
  funnelbackUrl.searchParams.set('num_ranks', String(safeNum));

  // -----------------------------
  // ✅ 7. Fetch with timeout
  // -----------------------------
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  let response;

  try {
    response = await fetch(funnelbackUrl.toString(), {
      signal: controller.signal,
    });
  } catch (err) {
    return new Response('Upstream timeout', { status: 504 });
  } finally {
    clearTimeout(timeout);
  }

  // -----------------------------
  // ✅ 8. Return with strong caching
  // -----------------------------
  return new Response(await response.text(), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}