/**
 * User management API functions
 */

import {
  ApiResponse,
  BasicResponse,
} from "@/types/auth";
import { apiGet, apiPatch, tokenManager } from "@/lib/utils/api";

// User types based on API documentation
export interface UserProfile {
  firstname: string;
  lastname: string;
  phone: string | null;
  gender: string | null;
  enrollment_no: string | null;
  department: string | null;
}

export interface UserAddress {
  country: string | null;
  state: string | null;
}

export interface AdminUser {
  id: string;
  username: string | null;
  email: string;
  firstname: string | null;
  lastname: string | null;
  date_joined: string;
  roles: string[];
  is_active: boolean;
  profile?: UserProfile;
  address?: UserAddress;
}

export interface UsersListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  admin_users: number;
  organizer_users: number;
  participant_users: number;
  visitor_users: number;
  recent_registrations: number;
}

export interface UpdateUserRolesRequest {
  roles_to_add: string[];
  roles_to_remove: string[];
}

export interface UpdateUserStatusRequest {
  is_active: boolean;
}

export interface UpdateUserProfileRequest {
  firstname?: string;
  lastname?: string;
  phone?: string;
  gender?: string;
  enrollment_no?: string;
  department?: string;
}

export interface UpdateUserAddressRequest {
  country?: string;
  state?: string;
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<UserStats> {
  const response = await apiGet<ApiResponse<UserStats>>("/api/v1/admin/users/stats", tokenManager.getAuthHeader());
  return response.data;
}

/**
 * Get list of users with pagination and filtering
 */
export async function getUsers(params?: {
  page?: number;
  per_page?: number;
  role_filter?: string;
  status_filter?: string;
  search?: string;
}): Promise<UsersListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
  if (params?.role_filter) queryParams.append('role_filter', params.role_filter);
  if (params?.status_filter) queryParams.append('status_filter', params.status_filter);
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const url = `/api/v1/admin/users${queryString ? `?${queryString}` : ''}`;

  const response = await apiGet<ApiResponse<UsersListResponse>>(url, tokenManager.getAuthHeader());
  return response.data;
}

/**
 * Get user details by ID
 */
export async function getUserDetails(userId: string): Promise<AdminUser> {
  const response = await apiGet<ApiResponse<AdminUser>>(`/api/v1/admin/users/${userId}`, tokenManager.getAuthHeader());
  return response.data;
}

/**
 * Update user roles
 */
export async function updateUserRoles(
  userId: string,
  roleData: UpdateUserRolesRequest
): Promise<{ roles: string[] }> {
  const response = await apiPatch<ApiResponse<{ roles: string[] }>>(
    `/api/v1/admin/users/${userId}/roles`,
    roleData,
    tokenManager.getAuthHeader()
  );
  return response.data;
}

/**
 * Update user status (activate/deactivate)
 */
export async function updateUserStatus(
  userId: string,
  statusData: UpdateUserStatusRequest
): Promise<{ user_id: string; is_active: boolean }> {
  const response = await apiPatch<ApiResponse<{ user_id: string; is_active: boolean }>>(
    `/api/v1/admin/users/${userId}/status`,
    statusData,
    tokenManager.getAuthHeader()
  );
  return response.data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  profileData: UpdateUserProfileRequest
): Promise<{ profile: UserProfile }> {
  const response = await apiPatch<ApiResponse<{ profile: UserProfile }>>(
    `/api/v1/admin/users/${userId}/profile`,
    profileData,
    tokenManager.getAuthHeader()
  );
  return response.data;
}

/**
 * Update user address
 */
export async function updateUserAddress(
  userId: string,
  addressData: UpdateUserAddressRequest
): Promise<{ address: UserAddress }> {
  const response = await apiPatch<ApiResponse<{ address: UserAddress }>>(
    `/api/v1/admin/users/${userId}/address`,
    addressData,
    tokenManager.getAuthHeader()
  );
  return response.data;
}
