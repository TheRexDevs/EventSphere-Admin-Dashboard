"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * ConfirmDialog renders a reusable confirmation modal with a title,
 * description, and configurable action/cancel buttons.
 *
 * It is fully controlled via `open` and `onOpenChange`, and emits `onConfirm`
 * when the user accepts. Consumers can optionally pass `isLoading` to control
 * button disabled state during async operations or allow this component to
 * manage a local loading state when `manageLoading` is true.
 */
export interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => Promise<void> | void;
	isLoading?: boolean;
	manageLoading?: boolean;
	destructive?: boolean;
}

const confirmDialogVariants = cva("", {
	variants: {
		rounded: {
			none: "rounded-none",
			normal: "rounded",
			lg: "rounded-lg",
			xl: "rounded-xl",
			xxl: "rounded-2xl",
			xxxl: "rounded-3xl",
		},
	},
	defaultVariants: {
		rounded: "none",
	},
});

export default function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmText = "Confirm",
	cancelText = "Cancel",
	onConfirm,
	isLoading,
	manageLoading = true,
	destructive = true,
	rounded,
}: ConfirmDialogProps & VariantProps<typeof confirmDialogVariants>) {
	const [internalLoading, setInternalLoading] = useState(false);

	useEffect(() => {
		if (!open) setInternalLoading(false);
	}, [open]);

	// Close on Escape key
	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onOpenChange(false);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [open, onOpenChange]);

	const confirming = manageLoading ? internalLoading : !!isLoading;
	const confirmVariant = destructive ? "destructive" : "default";

	const handleConfirm = async () => {
		if (manageLoading) setInternalLoading(true);
		try {
			await onConfirm();
			onOpenChange(false);
		} finally {
			if (manageLoading) setInternalLoading(false);
		}
	};

	return !open ? null : (
		<div className="fixed inset-0 z-[60]">
			<div
				className="absolute inset-0 bg-black/50"
				onClick={() => onOpenChange(false)}
			/>
			{/* Use pointer-events to ensure only dialog captures clicks; backdrop closes */}
			<div className="absolute inset-0 grid place-items-center p-4 pointer-events-none">
				<div 
					className={cn(
						confirmDialogVariants({ rounded }),
						"w-full max-w-md border bg-card p-6 shadow-xl pointer-events-auto",
					)}
				>
					<div className="space-y-2">
						<h2 className="text-lg font-semibold">{title}</h2>
						{description ? (
							<p className="text-sm text-muted-foreground">
								{description}
							</p>
						) : null}
					</div>
					<div className="mt-6 flex items-center justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={confirming}
						>
							{cancelText}
						</Button>
						<Button
							type="button"
							variant={confirmVariant as any}
							onClick={handleConfirm}
							disabled={confirming}
						>
							{confirming ? "Working..." : confirmText}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
