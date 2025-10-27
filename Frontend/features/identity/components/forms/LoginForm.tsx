"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useIdentityStore } from "@/features/identity/stores/identityStore";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Min 8 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useIdentityStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      console.log("🔍 LoginForm: Attempting login with identity store");
      await login({
        email: data.email,
        password: data.password,
      });
      console.log("✅ LoginForm: Login successful");
      onSuccess?.();
    } catch (err) {
      console.error("❌ LoginForm: Login failed:", err);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-3xl p-8 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#0f172a,-20px_-20px_60px_#334155] border border-white/40 dark:border-slate-600/30 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl" />

        <div className="relative text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
            Welcome Back
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Sign in to continue your journey
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
              <input
                {...register("email")}
                type="email"
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155] border-0 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-300 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm flex items-center font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-4 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155] border-0 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-300 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm flex items-center font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center">
            <input
              {...register("rememberMe")}
              type="checkbox"
              className="rounded text-blue-600"
            />
            <label className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              Remember me
            </label>
          </div>

          {error && (
            <div className="p-4 bg-red-50/80 dark:bg-red-900/20 rounded-xl border border-red-200/30">
              <p className="text-red-700 dark:text-red-400 text-sm font-medium flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold text-lg rounded-xl shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] hover:shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff] transform hover:scale-[1.02] disabled:transform-none transition-all duration-300 flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-6 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-500 dark:text-slate-400 font-medium">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="w-full inline-flex justify-center items-center py-3 px-4 bg-white dark:bg-slate-800 rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] text-sm font-semibold text-slate-700 dark:text-slate-300 transition-all duration-300 transform hover:scale-[1.02]">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

          <button className="w-full inline-flex justify-center items-center py-3 px-4 bg-white dark:bg-slate-800 rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] text-sm font-semibold text-slate-700 dark:text-slate-300 transition-all duration-300 transform hover:scale-[1.02]">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-white/60 dark:bg-slate-800/60 rounded-2xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] border border-white/40 dark:border-slate-700/40 backdrop-blur-sm">
          <Shield className="w-4 h-4 text-green-500 mr-2" />
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Protected by enterprise-grade security
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
