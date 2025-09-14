import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
	"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border border-input flex items-center w-full min-w-0 text-base bg-transparent shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 px-3 py-1",
	{
		variants: {
			size: {
				default: "py-3 px-3 text-sm lg:text-sm",
				sm: "py-1.5 px-3 text-sm gap-1.5",
				lg: "py-3.5 lg:py-4.5 px-4 text-base",
			},
			shape: {
				rounded: "rounded-lg",
				pill: "rounded-full",
				square: "rounded-none",
			},
		},
		defaultVariants: {
			size: "default",
			shape: "square", // Changed to match base class
		},
	}
);

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> &
	VariantProps<typeof inputVariants>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ size, shape, className, type = "text", ...props }, ref) => (
		<input
			ref={ref}
			type={type}
			data-slot="input"
			className={cn(
				inputVariants({ size, shape, className }),
				"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1.5px]",
				"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
			)}
			{...props}
		/>
	)
);

Input.displayName = "Input";

export { Input };
