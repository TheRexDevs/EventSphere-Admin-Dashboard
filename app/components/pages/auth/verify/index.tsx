"use client"
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/app/components/ui/input-otp";

import { showToast } from "@/lib/utils/toast";
import { useAuth } from "@/app/contexts/AuthContext";
import { ApiError } from "@/lib/utils/api";
import { resendVerificationCode } from "@/lib/api/auth";
import { ArrowLeft, Mail } from "lucide-react";

const VerifyEmailPage = () => {
	const [code, setCode] = useState("");
	const [canResend, setCanResend] = useState(false);
	const [resendTimer, setResendTimer] = useState(60);

    const router = useRouter();
	const searchParams = useSearchParams();
	const { verifyEmail, isLoading: authLoading } = useAuth();

    /**
     * Renders the email verification screen and handles code submission/resend.
     * Email and reg_id are read from the query string.
     */
    const email = searchParams.get("email") ?? "your email";
	const regId = searchParams.get("reg_id") ?? "";

	useEffect(() => {
		if (resendTimer > 0) {
			const timer = setTimeout(
				() => setResendTimer(resendTimer - 1),
				1000
			);
			return () => clearTimeout(timer);
		} else {
			setCanResend(true);
		}
	}, [resendTimer]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (code.length !== 6) {
			showToast.error("Invalid code: Please enter a 6-digit verification code.");
			return;
		}

		if (!regId) {
			showToast.error("Invalid verification session. Please sign up again.");
			router.push("/signup");
			return;
		}

		try {
			await verifyEmail(code, regId);
			showToast.success("Email verified! Welcome to Folio Builder!");
			// Redirect to folios after successful verification
			router.push("/");
		} catch (error) {
			if (error instanceof ApiError) {
				showToast.error(error.message);
			} else {
				showToast.error("Verification failed. Please try again.");
			}
		}
	};

	const handleResendCode = async () => {
		if (!canResend || !regId) return;

        try {
			await resendVerificationCode(regId);
			showToast.success("A new verification code has been sent to your email.");
			setCanResend(false);
			setResendTimer(60);
		} catch (error) {
			if (error instanceof ApiError) {
				showToast.error(error.message);
			} else {
				showToast.error("Failed to resend code. Please try again later.");
			}
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10">
						<Mail className="w-6 h-6 text-primary" />
					</div>
					<CardTitle className="text-2xl font-bold text-center">
						Verify your email
					</CardTitle>
					<CardDescription className="text-center">
						We&apos;ve sent a 6-digit verification code to{" "}
						<span className="font-medium text-foreground">
							{email}
						</span>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-3">
							<label className="text-sm font-medium text-center block">
								Enter verification code
							</label>
							<div className="flex justify-center">
								<InputOTP
									maxLength={6}
									value={code}
									onChange={setCode}
									onComplete={(value) => setCode(value)}
								>
									<InputOTPGroup className="gap-4">
										<InputOTPSlot index={0} />
										<InputOTPSlot index={1} />
										<InputOTPSlot index={2} />
										<InputOTPSlot index={3} />
										<InputOTPSlot index={4} />
										<InputOTPSlot index={5} />
									</InputOTPGroup>
								</InputOTP>
							</div>
						</div>

						<Button
							type="submit"
							className="w-full"
							disabled={authLoading || code.length !== 6}
						>
							{authLoading ? "Verifying..." : "Verify Email"}
						</Button>
					</form>

					<div className="mt-6 space-y-4">
						<div className="text-center">
							<p className="text-sm text-muted-foreground">
								Didn&apos;t receive the code?{" "}
								<Button
									variant={"link"}
									type="button"
									onClick={handleResendCode}
									disabled={!canResend || !regId}
									className="font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline px-1"
								>
									{canResend && regId
										? "Resend code"
										: `Resend in ${resendTimer}s`}
								</Button>
							</p>
						</div>

						<div className="text-center">
							<Button
								variant="ghost"
								type="button"
								onClick={() => window.history.back()}
								className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
							>
								<ArrowLeft className="w-4 h-4 mr-1" />
								Back to signup
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default VerifyEmailPage;
