"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function AuthRedirectHandler() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth to initialize

    const currentPath = window.location.pathname;
    const isPublicRoute = ["/login", "/register"].some((route) =>
      currentPath.startsWith(route)
    );

    // If authenticated and trying to access auth pages, redirect to dashboard
    if (isAuthenticated && isPublicRoute) {
      router.replace("/dashboard");
    }

    // If not authenticated and trying to access protected routes, redirect to login
    if (!isAuthenticated && !isPublicRoute && currentPath !== "/") {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  return null; // This component doesn't render anything
}
