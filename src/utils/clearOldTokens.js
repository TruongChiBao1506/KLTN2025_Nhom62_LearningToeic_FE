/**
 * Clear old localStorage tokens (backward compatibility)
 * This should run once when app loads to clean up old tokens
 */
export const clearOldTokens = () => {
  const oldTokenKeys = [
    'adminToken',
    'adminRefreshToken',
    'adminAccessTokenExpirationTime',
    'adminRefreshTokenExpirationTime',
    'teacherToken',
    'teacherRefreshToken',
    'teacherAccessTokenExpirationTime',
    'teacherRefreshTokenExpirationTime',
    'learnerToken',
    'learnerRefreshToken',
    'learnerAccessTokenExpirationTime',
    'learnerRefreshTokenExpirationTime',
    'learnerAuthenticated',
    'accessToken',
    'refreshToken',
  ];

  let hadOldTokens = false;
  
  oldTokenKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      hadOldTokens = true;
      localStorage.removeItem(key);
    }
  });

  if (hadOldTokens) {
    console.log('🧹 Cleaned up old localStorage tokens. Please login again for security.');
  }
};
