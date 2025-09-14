"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import FullScreenLoader from "@/app/components/ui/fullscreen-loader";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace(`/login?redirect=true&from=${pathname}`);
        }
    }, [user, isLoading, router, pathname]);

    if (isLoading) return <FullScreenLoader label="Loading your workspace..." />;

    if (!user) return <FullScreenLoader label="Redirecting to login..." />;

    return <>{children}</>;
}
