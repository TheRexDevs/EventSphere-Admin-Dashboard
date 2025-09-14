"use client";

import React from "react";

/**
 * FullScreenLoader renders a centered spinner with an optional label,
 * covering the entire viewport. Use during auth transitions/redirects
 * to avoid blank screens.
 */
export default function FullScreenLoader({ label = "Please wait..." }: { label?: string }) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
			<div className="flex flex-col items-center gap-3">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				<p className="text-sm text-muted-foreground">{label}</p>
			</div>
		</div>
	);
}


