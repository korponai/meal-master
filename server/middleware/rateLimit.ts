import { createError, H3Event } from "h3";
import { RATE_LIMIT_CONFIG } from "~/constants/ai";

interface RateLimit {
  count: number;
  resetTime: number;
}

// In-memory rate limit storage
const rateLimits = new Map<string, RateLimit>();

/**
 * Rate limiting middleware for AI endpoints
 * Limits requests to prevent API abuse and control costs
 *
 * Configuration is centralized in ~/constants/ai.ts
 */
export default defineEventHandler(async (event: H3Event) => {
  const path = event.path;

  // Only apply to AI endpoints
  if (!path.includes("/api/ai/")) {
    return;
  }

  // Get user from event context (set by Supabase auth middleware)
  const user = event.context.user;

  // If no user, let it pass (will be handled by auth middleware)
  if (!user || !user.id) {
    return;
  }

  const key = `${user.id}:${path}`;
  const now = Date.now();
  const limit = rateLimits.get(key);

  if (limit) {
    if (now < limit.resetTime) {
      // Within the time window
      if (limit.count >= RATE_LIMIT_CONFIG.MAX_REQUESTS) {
        throw createError({
          statusCode: 429,
          message: `Too many requests. Please try again in ${Math.ceil((limit.resetTime - now) / 1000)} seconds.`,
        });
      }
      limit.count++;
    } else {
      // Time window expired, reset
      rateLimits.set(key, {
        count: 1,
        resetTime: now + RATE_LIMIT_CONFIG.WINDOW_MS,
      });
    }
  } else {
    // First request
    rateLimits.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.WINDOW_MS,
    });
  }

  // Clean up old entries periodically (every 100 requests)
  if (Math.random() < 0.01) {
    const cutoff = now - RATE_LIMIT_CONFIG.WINDOW_MS * 2;
    for (const [k, v] of rateLimits.entries()) {
      if (v.resetTime < cutoff) {
        rateLimits.delete(k);
      }
    }
  }
});
