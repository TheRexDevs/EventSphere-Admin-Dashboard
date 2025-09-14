import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils"

const TextareaVariants = cva(
	"border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[1.5px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
	{
		variants: {
			size: {
				default: "min-h-16 px-3 py-2 text-base lg:text-sm",
				sm: "min-h-12 px-3 py-2 text-sm",
				lg: "min-h-30 px-3 py-3.5 text-base",
			},
			shape: {
				rounded: "rounded-lg",
				square: "rounded-none",
			},
		},
		defaultVariants: {
			size: "default",
			shape: "square", // Changed to match base class
		},
	}
);

type TextareaProps = React.ComponentProps<"textarea"> &
	VariantProps<typeof TextareaVariants>;

function Textarea({ size, shape, className, ...props }: TextareaProps) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				TextareaVariants({ size, shape }),
				className
			)}
			{...props}
		/>
	);
}

export { Textarea }
