interface User {
	id: string;
	email: string;
	name?: string;
	role: "user" | "admin";
	createdAt: string;
}

interface AuthResponse {
	user: User;
	token: string;
}

interface ApiError {
	message: string;
	code?: string;
	status?: number;
}
