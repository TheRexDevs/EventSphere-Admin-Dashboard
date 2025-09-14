"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import { showToast } from "@/lib/utils/toast";
import { signupSchema, type SignupFormData } from "@/lib/schemas/auth";
import { useAuth } from "@/app/contexts/AuthContext";
import { ApiError } from "@/lib/utils/api";
import { checkEmailAvailability } from "@/lib/api/auth";
import { Button } from "@/app/components/ui/button";
import FieldWrapper from "@/app/components/common/field-wrapper";
import { Form } from "@/app/components/ui/form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";


/**
 * SignupPage component - handles user registration and redirects to email verification
 */
const SignupPage = () => {
    const router = useRouter();
	const { signup, isLoading } = useAuth();
	const [emailStatus, setEmailStatus] = useState<{
		checking: boolean;
		available: boolean | null;
		message: string;
	}>({ checking: false, available: null, message: "" });
	
	// Cache for email availability to avoid duplicate checks
	const [emailCache] = useState(new Map<string, { available: boolean; timestamp: number }>());

	const form = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const watchedEmail = useWatch({ control: form.control, name: "email" });

	// Debounced email availability check with caching and abort controller
	const checkEmail = useCallback(async (email: string, signal?: AbortSignal) => {
		// Only check if email is properly formatted
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email || !emailRegex.test(email)) {
			setEmailStatus({ checking: false, available: null, message: "" });
			return;
		}

		// Check cache first (valid for 5 minutes)
		const cached = emailCache.get(email);
		const cacheExpiry = 5 * 60 * 1000; // 5 minutes
		if (cached && Date.now() - cached.timestamp < cacheExpiry) {
			setEmailStatus({
				checking: false,
				available: cached.available,
				message: cached.available ? "Email is available" : "Email is already taken",
			});
			return;
		}

		setEmailStatus({ checking: true, available: null, message: "Checking..." });

		try {
			const result = await checkEmailAvailability(email);
			// Check if request was aborted
			if (signal?.aborted) return;
			
			// Cache the result
			emailCache.set(email, { available: result.available, timestamp: Date.now() });
			
			setEmailStatus({
				checking: false,
				available: result.available,
				message: result.available ? "Email is available" : "Email is already taken",
			});
		} catch {
			// Don't update state if request was aborted
			if (signal?.aborted) return;
			
			setEmailStatus({
				checking: false,
				available: null,
				message: "",
			});
		}
	}, [emailCache]);

	// Debounce email check with abort controller
	useEffect(() => {
		const abortController = new AbortController();
		
		const timer = setTimeout(() => {
			if (watchedEmail && !form.formState.errors.email) {
				checkEmail(watchedEmail, abortController.signal);
			} else {
				setEmailStatus({ checking: false, available: null, message: "" });
			}
		}, 500);

		return () => {
			clearTimeout(timer);
			abortController.abort(); // Cancel ongoing request on cleanup
		};
	}, [watchedEmail, checkEmail, form.formState.errors.email]);

	const onSubmit = async (data: SignupFormData) => {
		// Check email availability before submission
		if (emailStatus.available === false) {
			form.setError("email", {
				type: "manual",
				message: "Email is already taken",
			});
			return;
		}
		try {
			// Map form data to API format
			const signupData = {
				email: data.email,
				firstname: data.firstName,
				lastname: data.lastName,
				password: data.password,
			};

			const regId: string = await signup(signupData);
			
			showToast.success("Account created! Please check your email for verification.");

			// Redirect to verification page with email and reg_id
			const params = new URLSearchParams({
				email: data.email,
				reg_id: regId,
			});
			router.push(`/verify-email?${params.toString()}`);
		} catch (error) {
			if (error instanceof ApiError) {
				// Handle specific API errors
				if (error.errors) {
					// Set field-specific errors only
					Object.entries(error.errors).forEach(([field, messages]) => {
						if (messages.length > 0) {
							form.setError(field as keyof SignupFormData, {
				type: "manual",
								message: messages[0],
							});
						}
					});
				} else {
					// General errors show as toast
					showToast.error(error.message);
				}
			} else {
				showToast.error("Something went wrong. Please try again.");
			}
		}
	};
	return (
		<div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						Create your account
					</CardTitle>
					<CardDescription className="text-center">
						Sign up to start building your online portfolio
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4"
						>
							<div className="grid grid-cols-2 gap-4">
								<FieldWrapper
									control={form.control}
									name="firstName"
									label="First name"
									placeholder="John"
								/>

								<FieldWrapper
									control={form.control}
									name="lastName"
									label="Last name"
									placeholder="Doe"
								/>
							</div>

							<FieldWrapper
								control={form.control}
								name="email"
								label="Email"
								placeholder="john@example.com"
								helperText={emailStatus.message}
								helperTextColor={
									emailStatus.checking
										? "text-blue-600"
										: emailStatus.available === true
										? "text-green-600"
										: emailStatus.available === false
										? "text-red-600"
										: undefined
								}
							/>

							<FieldWrapper
								control={form.control}
								name="password"
								label="Password"
								type="password"
								placeholder="Create a password"
							/>

							<FieldWrapper
								control={form.control}
								name="confirmPassword"
								label="Confirm password"
								type="password"
								placeholder="Confirm your password"
							/>


							<Button
								type="submit"
								className="w-full"
								disabled={form.formState.isSubmitting || isLoading}
							>
								{form.formState.isSubmitting || isLoading
									? "Creating account..."
									: "Create account"}
							</Button>
						</form>
					</Form>
					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600">
							Already have an account?{" "}
							<Link
								href="/login"
								className="font-medium text-primary hover:underline"
							>
								Sign in
							</Link>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default SignupPage;
