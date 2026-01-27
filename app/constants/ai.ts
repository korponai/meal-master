/**
 * AI model configuration constants
 * Centralized settings for OpenAI API calls
 */

export const AI_CONFIG = {
  /**
   * Temperature settings for different use cases
   * Higher = more creative, Lower = more deterministic
   */
  TEMPERATURE: {
    /** High creativity (0.9) - for brainstorming, varied outputs */
    CREATIVE: 0.9,
    /** Balanced (0.7) - good for recipe generation */
    BALANCED: 0.7,
    /** Low creativity (0.3) - for factual, consistent outputs */
    PRECISE: 0.3,
  },

  /**
   * Maximum token limits for different endpoints
   */
  MAX_TOKENS: {
    /** Recipe generation - full recipe with ingredients and instructions */
    RECIPE: 1000,
    /** Nutritional information - JSON response with nutrient data */
    NUTRIENTS: 500,
    /** Recipe image generation prompts */
    IMAGE_PROMPT: 200,
  },

  /**
   * Default models to use
   */
  MODELS: {
    CHAT: "gpt-4o-mini",
    IMAGE: "dall-e-3",
  },
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  /** Time window for rate limiting in milliseconds (1 minute) */
  WINDOW_MS: 60000,
  /** Maximum requests per window per user */
  MAX_REQUESTS: 10,
  /** Probability of cleanup run (1% chance on each request) */
  CLEANUP_PROBABILITY: 0.01,
} as const;
