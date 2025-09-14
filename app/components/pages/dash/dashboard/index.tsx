"use client";

import { useEffect, useState } from "react";
import { useAuth, hasPermission, PERMISSIONS } from "@/app/contexts/AuthContext";
import { getEventStats } from "@/lib/api/events";
import { getUserStats } from "@/lib/api/users";
import { showToast } from "@/lib/utils/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Users, Calendar, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/app/components/ui/skeleton";
import Link from "next/link";

interface DashboardStats {
	events: number;
	users: number;
	certificates: number;
	pendingEvents?: number;
	approvedEvents?: number;
}

const HomeDashboard = () => {
	const { user } = useAuth();
	const [dashboardLoading, setDashboardLoading] = useState(true);

	const [stats, setStats] = useState<DashboardStats>({
		events: 0,
		users: 0,
		certificates: 0,
		pendingEvents: 0,
		approvedEvents: 0,
	});

	// Check permissions
	const canViewUsers = hasPermission(user?.roles || [], PERMISSIONS.MANAGE_USERS);
	const canViewEvents = hasPermission(user?.roles || [], PERMISSIONS.VIEW_ALL_EVENTS);

	useEffect(() => {
		const loadData = async () => {
			try {
				// Load data based on permissions
				const promises = [];

				if (canViewEvents) {
					promises.push(getEventStats());
				}

				if (canViewUsers) {
					promises.push(getUserStats());
				}

				const results = await Promise.all(promises);

				let eventData: { total_events?: number; pending_events?: number; approved_events?: number } | null = null;
				let userData: { total_users?: number } | null = null;

				if (canViewEvents && results.length > 0) {
					eventData = results[0] as { total_events?: number; pending_events?: number; approved_events?: number };
				}

				if (canViewUsers && results.length > (canViewEvents ? 1 : 0)) {
					userData = results[canViewEvents ? 1 : 0] as { total_users?: number };
				}

				setStats({
					events: eventData?.total_events || 0,
					users: userData?.total_users || 0,
					certificates: 0, // TODO: Add certificate stats API
					pendingEvents: eventData?.pending_events || 0,
					approvedEvents: eventData?.approved_events || 0,
				});

			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard data";
				console.error("Dashboard error:", err);
				showToast.error(errorMessage);
			} finally {
				setDashboardLoading(false);
			}
		};
		
		loadData();
	}, [canViewUsers, canViewEvents]);

	if (dashboardLoading) {
		return <DashboardSkeleton />;
	}

	return (
			<div className="space-y-6">
			{/* Header */}
				<div className="flex justify-between items-center">
					<div>
					<h1 className="text-3xl font-bold">Dashboard</h1>
						<p className="text-gray-600 mt-2">
						Welcome back! Here&apos;s what&apos;s happening with your events.
						</p>
					</div>
				</div>


			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{canViewEvents && (
					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Events</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.events}</div>
							{stats.pendingEvents !== undefined && (
								<p className="text-xs text-muted-foreground">
									{stats.pendingEvents} pending approval
								</p>
							)}
							<Link href="/events">
								<Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
									View Events →
								</Button>
							</Link>
						</CardContent>
					</Card>
				)}

				{canViewUsers && (
					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Users</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.users}</div>
							<p className="text-xs text-muted-foreground">
								Active participants
							</p>
							<Link href="/users">
								<Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
									Manage Users →
								</Button>
							</Link>
						</CardContent>
					</Card>
				)}

				{canViewEvents && stats.pendingEvents !== undefined && (
					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-orange-600">{stats.pendingEvents}</div>
							<p className="text-xs text-muted-foreground">
								Events awaiting approval
							</p>
						</CardContent>
					</Card>
				)}

				{canViewEvents && stats.approvedEvents !== undefined && (
					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Approved Events</CardTitle>
							<CheckCircle className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600">{stats.approvedEvents}</div>
							<p className="text-xs text-muted-foreground">
								Ready to publish
							</p>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Quick Actions */}
					<Card>
						<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent>
					<div className="flex flex-wrap gap-4">
						{canViewEvents && (
							<Link href="/events/create">
								<Button>
									<Calendar className="h-4 w-4 mr-2" />
									Create Event
								</Button>
							</Link>
						)}
						{canViewUsers && (
							<Link href="/users">
								<Button variant="outline">
									<Users className="h-4 w-4 mr-2" />
									Manage Users
								</Button>
							</Link>
						)}
						{canViewEvents && (
							<Link href="/events">
								<Button variant="outline">
									<CheckCircle className="h-4 w-4 mr-2" />
									View All Events
								</Button>
							</Link>
						)}
					</div>
						</CardContent>
					</Card>
				</div>
	);
};

export default HomeDashboard;


export function DashboardSkeleton() {
	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<Skeleton className="h-8 w-48 mb-2" />
					<Skeleton className="h-4 w-64" />
				</div>
				<Skeleton className="h-10 w-32" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[1, 2, 3].map((i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-6 w-24" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-16 mb-2" />
							<Skeleton className="h-4 w-24" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}