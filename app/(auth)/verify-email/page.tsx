import { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailPage from "@/app/components/pages/auth/verify";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Verify Email",
		description: "",
		alternates: {
			canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/signup/verify-email`,
		},
		openGraph: {
			description: "",
			title: "Verify Email",
		},
	};
}

const VerifyEmail = () => {
	return (
		<Suspense fallback={null}>
			<VerifyEmailPage />
		</Suspense>
	);
};

export default VerifyEmail;
