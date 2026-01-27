export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * Safely parse unknown errors into a consistent AppError format
 * @param error - The unknown error to parse
 * @returns A typed AppError with message and optional code/statusCode
 */
export const parseError = (error: unknown): AppError => {
  // Handle Error instances
  if (error instanceof Error) {
    return { message: error.message };
  }

  // Handle error objects with message property
  if (typeof error === "object" && error !== null && "message" in error) {
    const errorObj = error as Record<string, unknown>;
    return {
      message: String(errorObj.message),
      code: errorObj.code ? String(errorObj.code) : undefined,
      statusCode:
        typeof errorObj.statusCode === "number"
          ? errorObj.statusCode
          : undefined,
    };
  }

  // Handle string errors
  if (typeof error === "string") {
    return { message: error };
  }

  // Fallback for unknown error types
  return { message: "An unknown error occurred" };
};
