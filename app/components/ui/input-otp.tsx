"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority";
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-centerdisabled:opacity-50",
        containerClassName
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}
const OTPSlotVariants = cva(
	"data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 relative flex h-9 w-9 items-center justify-center text-sm shadow-xs transition-all outline-none border-input border-y border-r first:border-l data-[active=true]:z-10 data-[active=true]:ring-[2px]",
	{
		variants: {
			size: {
				default: "h-10 w-10 text-sm lg:text-sm",
				sm: "h-6 w-6 text-sm",
				lg: "h-13 w-13 text-base",
			},
			shape: {
				rounded: "first:rounded-l-lg last:rounded-r-lg",
				pill: "first:rounded-l-full last:rounded-r-full",
				square: "first:rounded-l-none last:rounded-r-none",
			},
		},
		defaultVariants: {
			size: "default",
			shape: "square", // Changed to match base class
		},
	}
);

type OTPSlotProps = React.ComponentProps<"div"> & { index: number } &
	VariantProps<typeof OTPSlotVariants>;

function InputOTPSlot({
	index,
	size,
	shape,
	className,
	...props
}: OTPSlotProps) {
	const inputOTPContext = React.useContext(OTPInputContext);
	const { char, hasFakeCaret, isActive } =
		inputOTPContext?.slots[index] ?? {};

	return (
		<div
			data-slot="input-otp-slot"
			data-active={isActive}
			className={cn(
				OTPSlotVariants({ size, shape, className })
			)}
			{...props}
		>
			{char}
			{hasFakeCaret && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
				</div>
			)}
		</div>
	);
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
