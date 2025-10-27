"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, Loader2 } from "lucide-react";

export default function IdentityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex items-center justify-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-4 -left-4 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />

        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0f172a,-12px_-12px_24px_#334155] flex items-center justify-center animate-pulse">
            <Shield className="w-12 h-12 text-white" />
          </div>

          <div className="mb-4">
            <Loader2 className="w-8 h-8 text-blue-500 mx-auto animate-spin" />
          </div>

          <h2 className="text-xl font-semibold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">
            Initializing Identity
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Setting up secure authentication...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute -top-4 -right-4 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-purple-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-4 -left-4 w-96 h-96 bg-gradient-to-br from-purple-400/5 to-pink-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-400/3 to-cyan-500/3 rounded-full blur-3xl animate-pulse" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#334155] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    SecureApp
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Identity Management
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">{children}</div>
        </main>

        {/* Footer */}
        <footer className="p-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center px-6 py-3 bg-white/40 dark:bg-slate-800/40 rounded-2xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] border border-white/40 dark:border-slate-700/40 backdrop-blur-sm">
              <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400 mr-2" />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Protected by enterprise-grade security
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
