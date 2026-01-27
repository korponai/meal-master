/**
 * Authentication utility composable
 * Provides consistent user ID retrieval across the application
 */
export const useAuth = () => {
  const user = useSupabaseUser();

  /**
   * Get the current user's ID with proper validation
   * @returns The user ID as a string
   * @throws Error if user is not authenticated or ID is invalid
   */
  const getUserId = (): string => {
    const id = user.value?.id ?? user.value?.sub;

    if (!id || id === "undefined" || id === "null") {
      throw new Error(
        "User ID not available. Please ensure you are logged in.",
      );
    }

    return id;
  };

  /**
   * Check if user is currently authenticated
   * @returns true if user is logged in with valid ID
   */
  const isAuthenticated = (): boolean => {
    try {
      getUserId();
      return true;
    } catch {
      return false;
    }
  };

  return {
    getUserId,
    isAuthenticated,
  };
};
