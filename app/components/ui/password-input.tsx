import { forwardRef, useState, ComponentPropsWithoutRef } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = ComponentPropsWithoutRef<typeof Input>;

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
	({ className, ...props }, ref) => {
		const [showPassword, setShowPassword] = useState(false);

		return (
			<div className="relative">
				<Input
					ref={ref}
					type={showPassword ? "text" : "password"}
					className={className}
					{...props}
				/>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 transform text-muted-foreground hover:bg-transparent"
					onClick={() => setShowPassword(!showPassword)}
					aria-label={
						showPassword ? "Hide password" : "Show password"
					}
				>
					{showPassword ? (
						<EyeOff size={20} aria-hidden="true" />
					) : (
						<Eye size={20} aria-hidden="true" />
					)}
				</Button>
			</div>
		);
	}
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
