import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/app/components/ui/sidebar";

interface NavGroupProps {
	title: string;
	items: {
		title: string;
		url: string;
		icon?: LucideIcon;
		isActive?: boolean;
		items?: {
			title: string;
			url: string;
			isActive?: boolean;
		}[];
	}[];
}

export const NavGroup = ({ title, items }: NavGroupProps) => {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>{title}</SidebarGroupLabel>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					{items.map((item) =>
						item.items && item.items.length > 0 ? (
							<Collapsible
								key={item.title}
								asChild
								defaultOpen={item.isActive}
								className="group/collapsible"
							>
								<SidebarMenuItem>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton
											tooltip={item.title}
											className={item.isActive ? "bg-primary text-primary-foreground" : ""}
										>
											{item.icon && <item.icon />}
											<span>{item.title}</span>
											<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
										</SidebarMenuButton>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.items.map((subItem) => (
												<SidebarMenuSubItem
													key={subItem.title}
												>
													<SidebarMenuSubButton
														asChild
														className={subItem.isActive ? "bg-primary/10 text-primary" : ""}
													>
														<Link href={subItem.url}>
															<span>
																{subItem.title}
															</span>
														</Link>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>
						) : (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									asChild
									tooltip={item.title}
									className={item.isActive ? "bg-primary text-primary-foreground" : ""}
								>
									<Link
										href={item.url}
										className="flex items-center w-full"
									>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						)
					)}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
};
