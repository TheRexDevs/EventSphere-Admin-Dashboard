/**
 * Authentication related TypeScript interfaces and types
 */

// Base API response structure
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  status: "success" | "error";
  status_code: number;
}

// User data structure from backend
export interface UserWallet {
  balance: number | null;
  currency_code: string | null;
  currency_name: string | null;
  currency_symbol: string | null;
}

export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  username: string | null;
  phone: string | null;
  profile_picture: string;
  country: string | null;
  state: string | null;
  gender: string | null;
  date_joined: string;
  referral_link: string;
  roles: string[];
  wallet: UserWallet;
}

// Auth request types
export interface SignupRequest {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
}

export interface VerifyEmailRequest {
  code: string;
  reg_id: string;
}

export interface LoginRequest {
  email_username: string;
  password: string;
}

// Auth response types
export interface SignupResponse {
  reg_id: string;
}

export interface AuthSuccessResponse {
  access_token: string;
  user_data: User;
}

// API response wrappers
export type SignupApiResponse = ApiResponse<SignupResponse>;
export type VerifyEmailApiResponse = ApiResponse<AuthSuccessResponse>;
export type LoginApiResponse = ApiResponse<AuthSuccessResponse>;

// Error response
export interface ApiErrorResponse {
  message: string;
  status: "error";
  status_code: number;
  errors?: Record<string, string[]>;
}

// Responses without a data payload
export interface BasicResponse {
  message: string;
  status: "success" | "error";
  status_code: number;
}

// Resend verification code
export interface ResendCodeRequest {
  reg_id: string;
}

// Validate token - now uses Bearer auth, no request body needed
export interface ValidateTokenData {
  valid: boolean;
  type: "access" | string;
  expires_at: number;
  user_data: User;
}

export type ValidateTokenApiResponse = ApiResponse<ValidateTokenData>;

// Refresh token
export interface RefreshTokenData {
  access_token: string;
}

export type RefreshTokenApiResponse = ApiResponse<RefreshTokenData>;

// Check email availability
export interface CheckEmailRequest {
  email: string;
}

export interface CheckEmailData {
  available: boolean;
  email: string;
}

export type CheckEmailApiResponse = ApiResponse<CheckEmailData>;

// Check username availability
export interface CheckUsernameRequest {
  username: string;
}

export interface CheckUsernameData {
  available: boolean;
  username: string;
}

export type CheckUsernameApiResponse = ApiResponse<CheckUsernameData>;

// Auth context types
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signup: (data: SignupRequest) => Promise<string>; // returns reg_id
  verifyEmail: (code: string, regId: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  /**
   * Update the in-memory and persisted user with a partial payload.
   * Useful for profile edits without a full refetch.
   */
  updateUser: (partial: Partial<User>) => void;
}
