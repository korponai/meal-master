/**
 * Validation helper functions
 * Provides type-safe validation predicates for common use cases
 */

/**
 * Validates if a user ID is valid
 * Checks for existence and filters out string "undefined"/"null"
 *
 * @param id - The user ID to validate
 * @returns Type predicate - true if ID is a valid string
 *
 * @example
 * const userId = user.value?.id;
 * if (isValidUserId(userId)) {
 *   // TypeScript knows userId is string here
 *   await fetchUserData(userId);
 * }
 */
export const isValidUserId = (id: string | undefined | null): id is string => {
  return !!id && id !== "undefined" && id !== "null" && id.trim().length > 0;
};

/**
 * Validates if an email address is in valid format
 *
 * @param email - The email address to validate
 * @returns True if email format is valid
 *
 * @example
 * if (isValidEmail(userInput)) {
 *   // Proceed with email
 * }
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * Requires: min 8 chars, uppercase, lowercase, and number
 *
 * @param password - The password to validate
 * @returns Object with valid flag and array of error messages
 *
 * @example
 * const result = isValidPassword('MyPass123');
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 */
export const isValidPassword = (
  password: string,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Checks if a value is a non-empty string
 *
 * @param value - The value to check
 * @returns Type predicate - true if value is a non-empty string
 */
export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

/**
 * Validates if a URL is in valid format
 *
 * @param url - The URL to validate
 * @returns True if URL format is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Checks if a number is within a valid range
 *
 * @param value - The number to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if value is within range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};
