/**
 * Auth Helper Functions
 * Centralized authentication logic to avoid code duplication
 */

/**
 * Determine user role based on roles array
 * Priority: ADMIN > TEACHER > LEARNER
 */
export const determineUserRole = (roles) => {
  if (roles.includes("ROLE_ADMIN")) return "admin";
  if (roles.includes("ROLE_TEACHER")) return "teacher";
  if (roles.includes("ROLE_LEARNER")) return "user";
  return null;
};

/**
 * Determine userType and storageKey based on roles
 * Priority: ADMIN > TEACHER > LEARNER
 */
export const determineUserType = (roles) => {
  let userType = 'learner'; // default
  let storageKey = 'learnerUser'; // default
  
  if (roles.includes("ROLE_ADMIN")) {
    userType = 'admin';
    storageKey = 'user'; // Admin & Teacher share 'user' key
  } else if (roles.includes("ROLE_TEACHER")) {
    userType = 'teacher';
    storageKey = 'user'; // Admin & Teacher share 'user' key
  }

  return { userType, storageKey };
};

/**
 * Get success message based on user roles
 */
export const getSuccessMessage = (roles, userName = "bạn") => {
  if (roles.includes("ROLE_ADMIN")) {
    return `🎉 Đăng nhập thành công, chào mừng ${userName}!`;
  }
  if (roles.includes("ROLE_TEACHER")) {
    return `🎉 Đăng nhập thành công, chào mừng ${userName}!`;
  }
  return `🎉 Đăng nhập thành công, chào mừng ${userName} đến với TOEIC Learning!`;
};

/**
 * Get redirect route based on user roles
 * Priority: LEARNER > ADMIN > TEACHER
 */
export const getRedirectRoute = (roles) => {
  const routeMap = {
    ROLE_LEARNER: "/learner/",
    ROLE_ADMIN: "/admin/dashboard",
    ROLE_TEACHER: "/teacher/dashboard",
  };

  // Priority: LEARNER first (for multi-role users)
  if (roles.includes("ROLE_LEARNER")) return routeMap.ROLE_LEARNER;
  if (roles.includes("ROLE_ADMIN")) return routeMap.ROLE_ADMIN;
  if (roles.includes("ROLE_TEACHER")) return routeMap.ROLE_TEACHER;
  
  return null;
};

/**
 * Get error message based on error response
 */
export const getErrorMessage = (error) => {
  const errorMessages = {
    401: "❌ Tên đăng nhập hoặc mật khẩu không đúng.",
    403: "❌ Tài khoản của bạn đã bị khóa.",
    404: "❌ Tài khoản không tồn tại.",
  };

  const statusCode = error.response?.status;
  
  if (statusCode && errorMessages[statusCode]) {
    return errorMessages[statusCode];
  }
  
  if (error.response?.data?.message) {
    return `❌ ${error.response.data.message}`;
  }
  
  return "❌ Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.";
};

/**
 * Rate limiting for login attempts
 */
const LOGIN_ATTEMPTS_KEY = 'loginAttempts';
const LOCKOUT_END_KEY = 'loginLockoutEnd';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const rateLimiter = {
  /**
   * Check if user is locked out
   * @returns {Object} { isLocked: boolean, remainingTime: number }
   */
  checkLockout() {
    const lockoutEnd = localStorage.getItem(LOCKOUT_END_KEY);
    if (lockoutEnd && Date.now() < parseInt(lockoutEnd)) {
      const remainingTime = Math.ceil((parseInt(lockoutEnd) - Date.now()) / 60000);
      return { isLocked: true, remainingTime };
    }
    return { isLocked: false, remainingTime: 0 };
  },

  /**
   * Record login attempt
   * @returns {Object} { shouldLockout: boolean, attemptsLeft: number }
   */
  recordAttempt() {
    let attempts = parseInt(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '0');
    attempts++;
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, attempts.toString());

    if (attempts >= MAX_ATTEMPTS) {
      const lockoutEnd = Date.now() + LOCKOUT_DURATION;
      localStorage.setItem(LOCKOUT_END_KEY, lockoutEnd.toString());
      return { shouldLockout: true, attemptsLeft: 0 };
    }

    return { shouldLockout: false, attemptsLeft: MAX_ATTEMPTS - attempts };
  },

  /**
   * Reset login attempts on successful login
   */
  resetAttempts() {
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_END_KEY);
  },
};
