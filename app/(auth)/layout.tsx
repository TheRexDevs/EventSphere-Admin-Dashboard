
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import FullScreenLoader from "@/app/components/ui/fullscreen-loader";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            router.replace("/");
        }
    }, [user, isLoading, router]);

    if (!isLoading && user) return <FullScreenLoader label="Redirecting..." />;

    return (
        <div id="auth">
            {children}
        </div>
    );
}
