/**
 * Form validation constants
 * Centralized validation rules for consistency across the application
 */

export const VALIDATION_RULES = {
  /** User registration and profile */
  USER: {
    FULL_NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 100,
    },
    PASSWORD: {
      MIN_LENGTH: 8,
      MAX_LENGTH: 128,
    },
    BIO: {
      MAX_LENGTH: 500,
    },
  },

  /** Recipe validation */
  RECIPE: {
    TITLE: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 200,
    },
    DESCRIPTION: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 2000,
    },
    EXPERIENCE: {
      MAX_LENGTH: 1000,
    },
  },

  /** Ingredient validation */
  INGREDIENT: {
    NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 100,
    },
    QUANTITY: {
      MIN: 0.01,
      MAX: 10000,
    },
  },

  /** File upload limits */
  FILE: {
    IMAGE: {
      /** Maximum size in bytes (5MB) */
      MAX_SIZE: 5 * 1024 * 1024,
      /** Allowed MIME types */
      ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
    },
  },
} as const;

/**
 * Common regex patterns for validation
 */
export const VALIDATION_PATTERNS = {
  /** Email validation pattern */
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  /** At least one uppercase letter */
  HAS_UPPERCASE: /[A-Z]/,
  /** At least one lowercase letter */
  HAS_LOWERCASE: /[a-z]/,
  /** At least one number */
  HAS_NUMBER: /[0-9]/,
  /** URL validation pattern */
  URL: /^https?:\/\/.+/,
} as const;
