/**
 * Generates the Authorization header using Basic Auth for JIRA API requests
 * @returns the base64 encoded authorization header
 */
export const getAuthHeader = (username: string, authToken: string) => {
  const token = `Basic ${Buffer.from(`${username}:${authToken}`).toString(
    "base64"
  )}`;
  return token;
};
