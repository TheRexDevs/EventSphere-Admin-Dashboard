"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { showToast } from "@/lib/utils/toast";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";
import { useAuth } from "@/app/contexts/AuthContext";
import { ApiError } from "@/lib/utils/api";
import { Button } from "@/app/components/ui/button";

import {
    Form,
} from "@/app/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/app/components/ui/card";
import FieldWrapper from "@/app/components/common/field-wrapper";

/**
 * LoginPage component - handles user authentication
 */
export default function LoginPage() {
    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { login, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const from = searchParams.get("from") || "/";
    const hasShownToast = useRef(false);

    useEffect(() => {
        const isRedirect = searchParams.get("redirect") === "true";
        if (isRedirect && !hasShownToast.current) {
            hasShownToast.current = true;
            showToast.error("Please login to continue");
            // Clean up URL parameters without causing a refresh
            const newUrl = new URL(pathname, window.location.origin);
            searchParams.forEach((value, key) => {
                if (key !== "redirect") newUrl.searchParams.set(key, value);
            });
            window.history.replaceState({}, "", newUrl);
        }
    }, [searchParams, pathname]);

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data.email, data.password);
            showToast.success("Successfully logged in!");
            router.push(from);
        } catch (error) {
            if (error instanceof ApiError) {
                // Handle specific API errors
                if (error.errors) {
                    // Set field-specific errors only
                    Object.entries(error.errors).forEach(([field, messages]) => {
                        if (messages.length > 0) {
                            form.setError(field as keyof LoginFormData, {
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
                showToast.error("Login failed. Please try again.");
            }
        }
    };

    return (
		<div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						Welcome back
					</CardTitle>
					<CardDescription className="text-center">
						Sign in to your account to continue
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4"
						>
							<FieldWrapper
								control={form.control}
								name="email"
								label="Email"
								type="email"
								placeholder="Enter your email"
							/>

							<FieldWrapper
								control={form.control}
								name="password"
								label="Password"
								type="password"
								placeholder="Enter your password"
							/>


							<Button
								type="submit"
								className="w-full"
								disabled={form.formState.isSubmitting || isLoading}
							>
								{form.formState.isSubmitting
									? "Signing in..."
									: "Sign in"}
							</Button>
						</form>
					</Form>
					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600">
							Don&apos;t have an account?{" "}
							<Link
								href="/signup"
								className="font-medium text-primary hover:underline"
							>
								Sign up
							</Link>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
