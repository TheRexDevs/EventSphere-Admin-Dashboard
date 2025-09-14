"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/app/components/ui/sidebar";
import { DashSidebar } from "./sidebar";
import { DashHeader } from "./header"; 
// import { DashLayoutSkeleton } from "./DashLayoutSkeleton";


export default function Dashboard({
	children,
}: {
	children: React.ReactNode;
}) {
	// const router = useRouter();



	// Render the actual layout once folio data is loaded and validated
	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<DashSidebar variant="inset" />
			<SidebarInset>
				<div className="min-h-screen">
					<DashHeader />
					<div className="px-4 lg:px-8 py-4 lg:py-6">{children}</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
