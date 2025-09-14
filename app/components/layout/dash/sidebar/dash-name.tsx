"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Layers } from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/app/components/ui/sidebar";

export function DashName({ name }: { name: string }) {
	const { isMobile } = useSidebar();
	const [activeDash, setActiveDash] = React.useState(name);

	if (!activeDash) {
		return null;
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<div className="flex items-center gap-4 rounded-md py-4">
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-bold text-3xl">
							{name}
						</span>
                        <span className="!text-xs">
                            Event Management System
                        </span>
					</div>
				</div>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
