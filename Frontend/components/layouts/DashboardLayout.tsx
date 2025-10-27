"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIdentityStore } from "@/features/identity/stores/identityStore";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  BarChart3,
  FileText,
  Code2,
  Menu,
  LogOut,
  User,
  Moon,
  Sun,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Members", href: "/members", icon: Users },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Finance", href: "/finance", icon: DollarSign },
  { name: "Estimates", href: "/estimate", icon: FileText },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Playground", href: "/playground", icon: Code2 },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useIdentityStore();
  const { theme, toggleTheme } = useTheme();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 neomorphic-button flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Enterprise ERP
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                isActive
                  ? "neomorphic-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground neomorphic-button"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border/50">
        <div className="neomorphic-card p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 neomorphic-button flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.displayName ||
                  `${user?.firstName} ${user?.lastName}`.trim() ||
                  user?.email}
              </p>
              <p className="text-xs text-muted-foreground">{"Administrator"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TopNavbar = () => (
    <header className="neomorphic-card border-b border-border/50 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden neomorphic-button"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="neomorphic-button text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="neomorphic-button text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed left-0 top-0 h-full w-64 neomorphic-sidebar">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow neomorphic-sidebar overflow-y-auto">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
