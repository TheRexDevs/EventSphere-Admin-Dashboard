import ProtectedLayout from "../components/layout/protected-layout";
import SiteDashboard from "@/app/components/layout/dash";

export default function SiteLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ProtectedLayout>
			<SiteDashboard>{children}</SiteDashboard>
		</ProtectedLayout>
	);
}
