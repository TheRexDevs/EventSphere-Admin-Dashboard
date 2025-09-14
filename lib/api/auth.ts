/**
 * Authentication API functions
 */

import {
  SignupRequest,
  VerifyEmailRequest,
  LoginRequest,
  SignupApiResponse,
  VerifyEmailApiResponse,
  LoginApiResponse,
  User,
  BasicResponse,
  ValidateTokenData,
  ValidateTokenApiResponse,
  RefreshTokenApiResponse,
  CheckEmailApiResponse,
  CheckEmailData,
  CheckUsernameApiResponse,
  CheckUsernameData,
} from "@/types/auth";
import { apiPost, tokenManager } from "@/lib/utils/api";

function setAccessTokenCookie(token: string) {
  if (typeof document === "undefined") return;
  // 30 days
  const maxAge = 60 * 60 * 24 * 30;
  document.cookie = `access_token=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function persistUser(user: User) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("auth_user", JSON.stringify(user)); } catch {}
}

/**
 * Sign up a new user
 * @param userData - User registration data
 * @returns Registration ID for email verification
 */
export async function signupUser(userData: SignupRequest): Promise<string> {
  const response = await apiPost<SignupApiResponse>("/api/v1/auth/signup", userData);
  return response.data.reg_id;
}

/**
 * Verify user email with verification code
 * @param code - 6-digit verification code
 * @param regId - Registration ID from signup
 * @returns User data and access token
 */
export async function verifyEmail(
  code: string,
  regId: string
): Promise<{ user: User; token: string }> {
  const payload: VerifyEmailRequest = { code, reg_id: regId };
  const response = await apiPost<VerifyEmailApiResponse>("/api/v1/auth/verify-email", payload);
  
  // Store token
  tokenManager.set(response.data.access_token);
  setAccessTokenCookie(response.data.access_token);
  persistUser(response.data.user_data);
  
  return {
    user: response.data.user_data,
    token: response.data.access_token,
  };
}

/**
 * Login user with email and password
 * @param email - User email
 * @param password - User password
 * @returns User data and access token
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  const payload: LoginRequest = { email_username: email, password };
  const response = await apiPost<LoginApiResponse>("/api/v1/auth/login", payload);
  
  // Store token
  tokenManager.set(response.data.access_token);
  setAccessTokenCookie(response.data.access_token);
  persistUser(response.data.user_data);
  
  return {
    user: response.data.user_data,
    token: response.data.access_token,
  };
}

/**
 * Logout user and clear stored token
 */
export async function logoutUser(): Promise<void> {
  // TODO: Implement backend logout endpoint when available
  // For now, just clear the local token and user data
  tokenManager.remove();
  if (typeof document !== "undefined") {
    document.cookie = "access_token=; Path=/; Max-Age=0; SameSite=Lax";
  }
  if (typeof window !== "undefined") {
    try { 
      localStorage.removeItem("auth_user");
      // Clear any other auth-related localStorage items
      localStorage.removeItem("access_token");
    } catch {}
  }
}

/**
 * Validate current token and get user data
 * @param token - Access token to validate
 * @returns User data if token is valid, null otherwise
 */
export async function validateToken(token: string): Promise<User | null> {
  try {
    const result = await validateAccessToken(token);
    if (result.valid && result.user_data) {
      // Update stored user data with fresh data from backend
      persistUser(result.user_data);
      return result.user_data;
    }
    return null;
  } catch (error) {
    console.error("Token validation failed:", error);
    return null;
  }
}

/**
 * Resend verification code
 * @param regId - Registration ID
 */
export async function resendVerificationCode(regId: string): Promise<void> {
  await apiPost<BasicResponse>("/api/v1/auth/resend-code", { reg_id: regId });
}

/**
 * Validate an access token using Bearer authorization
 */
export async function validateAccessToken(token: string): Promise<ValidateTokenData> {
  const res = await apiPost<ValidateTokenApiResponse>(
    "/api/v1/auth/validate-token", 
    undefined, // No body needed
    { Authorization: `Bearer ${token}` }
  );
  return res.data;
}

/**
 * Refresh the current access token using Authorization header
 */
export async function refreshAccessToken(): Promise<string> {
  const res = await apiPost<RefreshTokenApiResponse>(
    "/api/v1/auth/refresh-token",
    undefined,
    tokenManager.getAuthHeader()
  );
  const newToken = res.data.access_token;
  tokenManager.set(newToken);
  setAccessTokenCookie(newToken);
  return newToken;
}

/**
 * Check email availability
 */
export async function checkEmailAvailability(email: string): Promise<CheckEmailData> {
  const res = await apiPost<CheckEmailApiResponse>("/api/v1/auth/check-email", { email });
  return res.data;
}

/**
 * Check username availability
 */
export async function checkUsernameAvailability(username: string): Promise<CheckUsernameData> {
  const res = await apiPost<CheckUsernameApiResponse>("/api/v1/auth/check-username", { username });
  return res.data;
}
