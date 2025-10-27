"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { LoginForm } from "@/features/identity/components/forms";
import { ArrowRight, UserPlus, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoading(true);

    toast.success("Welcome back! 🎉", {
      style: {
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        color: "white",
        borderRadius: "12px",
        padding: "16px",
      },
      duration: 3000,
    });

    // Small delay for better UX
    setTimeout(() => {
      router.push(redirect);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] flex items-center justify-center animate-pulse">
          <Lock className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
          Signing you in...
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Redirecting to your dashboard
        </p>
        <div className="w-8 h-8 mx-auto">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-full border border-blue-200/30 dark:border-blue-800/30 mb-6">
          <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Secure Login
          </span>
        </div>
      </div>

      {/* Login Form */}
      <LoginForm onSuccess={handleLoginSuccess} className="w-full" />

      {/* Alternative Actions */}
      <div className="space-y-4">
        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-500 dark:text-slate-400 font-medium">
              New to our platform?
            </span>
          </div>
        </div>

        {/* Sign Up Link */}
        <Link
          href="/register"
          className="group block w-full p-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] dark:hover:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#334155] border border-white/40 dark:border-slate-700/40 transition-all duration-300 transform hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Create Account
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Join thousands of users
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </Link>

        {/* Password Reset Link */}
        <Link
          href="/password-reset"
          className="group block w-full p-4 bg-white/40 dark:bg-slate-800/40 rounded-2xl shadow-[2px_2px_4px_#bebebe,-2px_-2px_4px_#ffffff] dark:shadow-[2px_2px_4px_#0f172a,-2px_-2px_4px_#334155] hover:shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:hover:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] border border-white/30 dark:border-slate-700/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg shadow-sm flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Forgot your password?
                </h3>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </Link>
      </div>

      {/* Security Notice */}
      <div className="text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          By signing in, you agree to our{" "}
          <Link
            href="/terms"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
