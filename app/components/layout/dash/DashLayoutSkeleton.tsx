import { Skeleton } from "@/app/components/ui/skeleton";
import { SidebarProvider, SidebarInset } from "@/app/components/ui/sidebar";
import { DashSidebarSkeleton } from "./sidebar";
import { DashHeaderSkeleton } from "./header";

export function DashLayoutSkeleton() {
	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			{/* Sidebar Skeleton */}
			<DashSidebarSkeleton variant="inset" />

			{/* Main Content Skeleton */}
			<SidebarInset>
				<div className="min-h-screen">
					<DashHeaderSkeleton />

					{/* Content */}
					<div className="px-4 lg:px-8 py-4 lg:py-6">
						<div className="space-y-6">
							<Skeleton className="h-8 w-48" /> {/* Page Title */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{[1, 2, 3].map((i) => (
									<Skeleton key={i} className="h-32 w-full" />
								))}
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
