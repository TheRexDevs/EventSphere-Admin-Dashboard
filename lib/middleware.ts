import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public allowlist patterns; all other routes require auth
const PUBLIC_PATTERNS: RegExp[] = [
	/^\/(login|signup|verify-email)\/?$/,
	/^\/api\/auth(\/.*)?$/,
	/^\/_next\/.*/,
	/^\/_static\/.*/,
	/^\/_vercel\/.*/,
	/^\/favicon\.ico$/,
	/^\/sitemap\.xml$/,
	/^\/$/,
];

function isPublicPath(pathname: string): boolean {
	return PUBLIC_PATTERNS.some((re) => re.test(pathname));
}

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get("access_token")?.value;

	// Unauthenticated access to non-public route → login
	if (!token && !isPublicPath(pathname)) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("from", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Authenticated user visiting auth pages → home
	if (token && /^(\/login|\/signup|\/verify-email)\/?$/.test(pathname)) {
		const homeUrl = new URL("/", request.url);
		return NextResponse.redirect(homeUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api/auth|_next|_static|_vercel|favicon.ico|sitemap.xml).*)",
	],
};
