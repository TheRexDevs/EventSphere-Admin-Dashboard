"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
	loginUser,
	logoutUser,
	signupUser,
	verifyEmail as verifyEmailApi,
	validateToken,
	refreshAccessToken,
} from "@/lib/api/auth";
import { tokenManager } from "@/lib/utils/api";
import { User, SignupRequest, AuthContextType } from "@/types/auth";
import { ApiError } from "@/lib/utils/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const token = tokenManager.get();
				if (token) {
					// First try to hydrate from localStorage for immediate UI
					try {
						const storedUser = localStorage.getItem("auth_user");
						if (storedUser) {
							setUser(JSON.parse(storedUser));
							setIsLoading(false); // Show UI immediately with cached user
						}
					} catch {}

					// Then validate token in background and update if needed
					try {
						const userData = await validateToken(token);
						if (userData) {
							setUser(userData); // Update with fresh data
						} else {
							// Token invalid, try refresh
							await refreshAccessToken();
							const newToken = tokenManager.get();
							if (newToken) {
								const refreshedUserData = await validateToken(newToken);
								if (refreshedUserData) {
									setUser(refreshedUserData);
								} else {
									// Refresh failed, clear auth
									tokenManager.remove();
									setUser(null);
								}
							}
						}
					} catch {
						// Validation/refresh failed, clear auth
						tokenManager.remove();
						setUser(null);
					}
				}
			} catch (err) {
				console.warn("Auth check failed:", err);
				tokenManager.remove();
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, []);

	const signup = async (userData: SignupRequest): Promise<string> => {
		try {
			setError(null);
			setIsLoading(true);
			const regId = await signupUser(userData);
			return regId;
		} catch (err) {
			const errorMessage =
				err instanceof ApiError ? err.message : "Signup failed";
			setError(errorMessage);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const verifyEmail = async (code: string, regId: string): Promise<void> => {
		try {
			setError(null);
			setIsLoading(true);
			const { user: userData } = await verifyEmailApi(code, regId);
			setUser(userData);
		} catch (err) {
			const errorMessage =
				err instanceof ApiError
					? err.message
					: "Email verification failed";
			setError(errorMessage);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const login = async (email: string, password: string): Promise<void> => {
		try {
			setError(null);
			setIsLoading(true);
			const { user: userData } = await loginUser(email, password);
			setUser(userData);
		} catch (err) {
			const errorMessage =
				err instanceof ApiError ? err.message : "Login failed";
			setError(errorMessage);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async (): Promise<void> => {
		try {
			setIsLoading(true);
			await logoutUser();
			setUser(null);
		} catch (err) {
			console.error("Logout failed:", err);
		} finally {
			setIsLoading(false);
		}
	};

	const clearError = (): void => {
		setError(null);
	};

	const updateUser = (partial: Partial<User>): void => {
		setUser((prev) => {
			if (!prev) return prev;
			const next = { ...prev, ...partial } as User;
			try {
				localStorage.setItem("auth_user", JSON.stringify(next));
			} catch {}
			return next;
		});
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				error,
				signup,
				verifyEmail,
				login,
				logout,
				clearError,
				updateUser,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

// Permission and role utilities
export const ROLES = {
	ADMIN: 'Admin',
	ORGANIZER: 'Organizer',
	PARTICIPANT: 'Participant',
	VISITOR: 'Visitor'
} as const;

export const PERMISSIONS = {
	// Event permissions
	CREATE_EVENT: 'create_event',
	EDIT_EVENT: 'edit_event',
	DELETE_EVENT: 'delete_event',
	APPROVE_EVENT: 'approve_event',
	PUBLISH_EVENT: 'publish_event',
	VIEW_ALL_EVENTS: 'view_all_events',

	// User permissions
	MANAGE_USERS: 'manage_users',
	VIEW_USERS: 'view_users',
	UPDATE_USER_ROLES: 'update_user_roles',
	ACTIVATE_DEACTIVATE_USERS: 'activate_deactivate_users',

	// Registration permissions
	MANAGE_REGISTRATIONS: 'manage_registrations',
	MARK_ATTENDANCE: 'mark_attendance',

	// Certificate permissions
	GENERATE_CERTIFICATES: 'generate_certificates',

	// System permissions
	SYSTEM_SETTINGS: 'system_settings',
	VIEW_ANALYTICS: 'view_analytics'
} as const;

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<string, string[]> = {
	[ROLES.ADMIN]: [
		PERMISSIONS.CREATE_EVENT,
		PERMISSIONS.EDIT_EVENT,
		PERMISSIONS.DELETE_EVENT,
		PERMISSIONS.APPROVE_EVENT,
		PERMISSIONS.PUBLISH_EVENT,
		PERMISSIONS.VIEW_ALL_EVENTS,
		PERMISSIONS.MANAGE_USERS,
		PERMISSIONS.VIEW_USERS,
		PERMISSIONS.UPDATE_USER_ROLES,
		PERMISSIONS.ACTIVATE_DEACTIVATE_USERS,
		PERMISSIONS.MANAGE_REGISTRATIONS,
		PERMISSIONS.MARK_ATTENDANCE,
		PERMISSIONS.GENERATE_CERTIFICATES,
		PERMISSIONS.SYSTEM_SETTINGS,
		PERMISSIONS.VIEW_ANALYTICS
	],
	[ROLES.ORGANIZER]: [
		PERMISSIONS.CREATE_EVENT,
		PERMISSIONS.EDIT_EVENT,
		PERMISSIONS.DELETE_EVENT,
		PERMISSIONS.VIEW_ALL_EVENTS,
		PERMISSIONS.MANAGE_REGISTRATIONS,
		PERMISSIONS.MARK_ATTENDANCE,
		PERMISSIONS.GENERATE_CERTIFICATES
	],
	[ROLES.PARTICIPANT]: [],
	[ROLES.VISITOR]: []
};

// Utility functions for role checking
export const hasRole = (userRoles: string[], requiredRole: string): boolean => {
	return userRoles.includes(requiredRole);
};

export const hasPermission = (userRoles: string[], permission: string): boolean => {
	return userRoles.some(role => {
		const rolePermissions = ROLE_PERMISSIONS[role];
		return rolePermissions ? rolePermissions.includes(permission) : false;
	});
};

export const isAdmin = (userRoles: string[]): boolean => hasRole(userRoles, ROLES.ADMIN);
export const isOrganizer = (userRoles: string[]): boolean => hasRole(userRoles, ROLES.ORGANIZER);
export const isAdminOrOrganizer = (userRoles: string[]): boolean =>
	isAdmin(userRoles) || isOrganizer(userRoles);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
