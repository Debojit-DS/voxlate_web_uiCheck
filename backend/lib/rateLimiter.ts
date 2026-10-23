type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count += 1;
  if (entry.count > limit) {
    return false;
  }

  return true;
}

export function getRateLimitRemaining(key: string): number {
  const entry = rateLimitMap.get(key);
  if (!entry || Date.now() > entry.resetAt) return 0;
  return Math.max(0, entry.count - 1);
}
