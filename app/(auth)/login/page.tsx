import { Metadata } from "next";
import { Suspense } from "react";

import LoginPage from "@/app/components/pages/auth/login";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Login",
		description: "",
		alternates: {
			canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/login/`,
		},
		openGraph: {
			description: "",
			title: "Login",
		},
	};
}

export default function Login() {
	return (
		<Suspense fallback={null}>
			<LoginPage />
		</Suspense>
	);
}
