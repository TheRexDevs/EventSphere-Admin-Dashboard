import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Treat all routes as protected by default, with a small public allowlist
const PUBLIC_PATTERNS: RegExp[] = [
	/^\/(login|signup|verify-email)\/?$/,
	/^\/api\/auth(\/.*)?$/,
	/^\/_next\/.*/,
	/^\/_static\/.*/,
	/^\/_vercel\/.*/,
	/^\/favicon\.ico$/,
	/^\/sitemap\.xml$/,
];

function isPublicPath(pathname: string): boolean {
	return PUBLIC_PATTERNS.some((re) => re.test(pathname));
}

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get("access_token")?.value;

	// If not authenticated and path is not public → redirect to login
	if (!token && !isPublicPath(pathname)) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("from", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// If authenticated and visiting auth pages → redirect home
	if (token && /^(\/login|\/signup|\/verify-email)\/?$/.test(pathname)) {
		const homeUrl = new URL("/", request.url);
		return NextResponse.redirect(homeUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		// Match all paths except Next internals and static files
		"/((?!api/auth|_next|_static|_vercel|favicon.ico|sitemap.xml).*)",
	],
};
