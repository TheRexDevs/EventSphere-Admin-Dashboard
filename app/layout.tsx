import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AuthProvider } from "@/app/contexts/AuthContext";
import { languages as langs } from "@/constants";
import { Toaster } from "@/app/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "EventSphere Management Dashboard",
	description: "College Event Information System.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang={langs[0]}>
			<body className={`${inter.className} antialiased`}>
				<AuthProvider>
					{children}
				</AuthProvider>
				<Toaster position="top-center" />
			</body>
		</html>
	);
}
