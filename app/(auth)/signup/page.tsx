import { Metadata } from "next";
import SignupPage from "@/app/components/pages/auth/signup";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Sign Up",
		description: "",
		alternates: {
			canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/signup/`,
		},
		openGraph: {
			description: "",
			title: "Register",
		},
	};
}

const Signup = () => {
	return <SignupPage/>;
};

export default Signup;
