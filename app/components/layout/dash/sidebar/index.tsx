"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
	Home,
	Settings,
	FolderOpen,
	Newspaper,
	StickyNote,
} from "lucide-react";

import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";
import { DashName } from "./dash-name";
import { useAuth, hasPermission, PERMISSIONS } from "@/app/contexts/AuthContext";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
} from "@/app/components/ui/sidebar";
import { Skeleton } from "@/app/components/ui/skeleton";

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	folios: [
		{
			name: "Dash 1",
			plan: "Pro",
		},
		{
			name: "Dash 2",
			plan: "Free",
		},
		{
			name: "Dash 3",
			plan: "Enterprise",
		},
	],
	navMain: [
		{
			title: "Dashboard",
			url: "/",
			icon: Home,
		},
	],
	navContents: [
		{
			title: "Events",
			url: "/events",
			icon: FolderOpen,
			items: [
				{
					title: "All Events",
					url: "/events",
				},
				{
					title: "Add new",
					url: "/events/create",
				},
				{
					title: "Categories",
					url: "/events/categories",
				},
			],
		},
		{
			title: "Users",
			url: "/users",
			icon: Newspaper,
			items: [
				{
					title: "All Users",
					url: "/users",
				},
				{
					title: "Add new",
					url: "/users/new",
				},
			],
		},
		{
			title: "Feedbacks",
			url: "/feedbacks",
			icon: StickyNote,
			items: [
				{
					title: "All Feedbacks",
					url: "/feedbacks",
				},
			],
		},
	],
	navUtils: [
		{
			title: "Settings",
			url: "/settings",
			icon: Settings,
		},
	],
};

export function DashSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();
	const { user } = useAuth();

	// Function to check if a navigation item should be active
	const isActive = (url: string, subItems?: { url: string }[]) => {
		// Check if current path matches the main URL
		if (pathname === url) return true;

		// Check if current path matches any sub-item URL
		if (subItems) {
			return subItems.some(subItem => pathname === subItem.url);
		}

		// Check if current path starts with the URL (for nested routes)
		if (url !== "/" && pathname.startsWith(url)) return true;

		return false;
	};

	// Filter navigation items based on user permissions
	const getFilteredNavItems = () => {
		if (!user?.roles) return { navMain: [], navContents: [], navUtils: [] };

		const userRoles = user.roles;

		// Platform items - Dashboard is available to all admin/organizer users
		const navMainWithActive = data.navMain.map(item => ({
			...item,
			isActive: isActive(item.url),
		}));

		// Content items - filter based on permissions
		const navContentsFiltered = data.navContents.filter(item => {
			// Events - available to admin and organizers
			if (item.title === "Events") {
				return hasPermission(userRoles, PERMISSIONS.VIEW_ALL_EVENTS);
			}
			// Users - only admin can see
			if (item.title === "Users") {
				return hasPermission(userRoles, PERMISSIONS.MANAGE_USERS);
			}
			// Feedbacks - available to both admin and organizers
			if (item.title === "Feedbacks") {
				return hasPermission(userRoles, PERMISSIONS.VIEW_ALL_EVENTS);
			}
			return false;
		});

		const navContentsWithActive = navContentsFiltered.map(item => ({
			...item,
			isActive: isActive(item.url, item.items),
			items: item.items?.map(subItem => ({
				...subItem,
				isActive: pathname === subItem.url,
			})),
		}));

		// Utils items - Settings available to admin only
		const navUtilsFiltered = data.navUtils.filter(item => {
			if (item.title === "Settings") {
				return hasPermission(userRoles, PERMISSIONS.SYSTEM_SETTINGS);
			}
			return false;
		});

		const navUtilsWithActive = navUtilsFiltered.map(item => ({
			...item,
			isActive: isActive(item.url),
		}));

		return {
			navMain: navMainWithActive,
			navContents: navContentsWithActive,
			navUtils: navUtilsWithActive
		};
	};

	const { navMain, navContents, navUtils } = getFilteredNavItems();

    return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<DashName name={"EventSphere"} />
			</SidebarHeader>
			<SidebarContent>
				{navMain.length > 0 && <NavGroup title="Platform" items={navMain} />}
				{navContents.length > 0 && <NavGroup title="Contents" items={navContents} />}
				{navUtils.length > 0 && <NavGroup title="Utils" items={navUtils} />}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}

export function DashSidebarSkeleton({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar variant="inset" collapsible="icon" {...props}>
			<SidebarHeader>
				{/* Dash Switcher Skeleton */}
				<Skeleton className="h-12 w-full mb-8" />
			</SidebarHeader>

			<SidebarContent>
				{/* Navigation Groups */}
				<SidebarGroup>
					<SidebarGroupContent>
						{/* Main Navigation */}
						<SidebarMenu>
							{[1, 2, 3, 4].map((i) => (
								<SidebarMenuItem key={i}>
									<div className="flex items-center mb-4">
										<Skeleton className="h-8 w-full" />
										{/* Label */}
									</div>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				{/* User Section */}
				<SidebarMenu>
					<SidebarMenuItem>
						<div className="flex items-center gap-3">
							<Skeleton className="h-8 w-8 rounded-full" />
							{/* Avatar */}
							<div className="space-y-1">
								<Skeleton className="h-3 w-20" />
								{/* Name */}
								<Skeleton className="h-3 w-16" />
								{/* Email */}
							</div>
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}