"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { SignupForm } from "@/features/identity/components/forms";
import { ArrowRight, LogIn, UserPlus, Shield, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegistrationSuccess = () => {
    setIsLoading(true);

    toast.success("Account created successfully! 🚀", {
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
      router.push("/dashboard");
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] flex items-center justify-center animate-pulse">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
          Creating your account...
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Setting up your secure workspace
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
        <div className="inline-flex items-center px-4 py-2 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-full border border-emerald-200/30 dark:border-emerald-800/30 mb-6">
          <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Create Account
          </span>
        </div>
      </div>

      {/* Registration Form */}
      <SignupForm onSuccess={handleRegistrationSuccess} className="w-full" />

      {/* Benefits Section */}
      <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-6 shadow-[inset_4px_4px_8px_#e2e8f0,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] border border-white/40 dark:border-slate-700/40">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-emerald-500" />
          Why join us?
        </h3>
        <div className="space-y-3">
          {[
            "🚀 Advanced project management tools",
            "🔒 Enterprise-grade security",
            "📊 Real-time analytics and reporting",
            "👥 Seamless team collaboration",
            "☁️ Cloud-based accessibility",
            "🎯 Customizable workflows",
          ].map((benefit, index) => (
            <div
              key={index}
              className="flex items-center text-sm text-slate-600 dark:text-slate-400"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 flex-shrink-0"></div>
              {benefit}
            </div>
          ))}
        </div>
      </div>

      {/* Alternative Actions */}
      <div className="space-y-4">
        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-500 dark:text-slate-400 font-medium">
              Already have an account?
            </span>
          </div>
        </div>

        {/* Sign In Link */}
        <Link
          href="/login"
          className="group block w-full p-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] dark:hover:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#334155] border border-white/40 dark:border-slate-700/40 transition-all duration-300 transform hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300">
                <LogIn className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Sign In
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Access your account
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </Link>
      </div>

      {/* Security Notice */}
      <div className="text-center space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          By creating an account, you agree to our{" "}
          <Link
            href="/terms"
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
          >
            Privacy Policy
          </Link>
        </p>

        {/* Security Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-white/40 dark:bg-slate-800/40 rounded-xl shadow-[2px_2px_4px_#bebebe,-2px_-2px_4px_#ffffff] dark:shadow-[2px_2px_4px_#0f172a,-2px_-2px_4px_#334155] border border-white/30 dark:border-slate-700/30">
          <Shield className="w-3 h-3 text-green-500 mr-2" />
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            SSL Encrypted & GDPR Compliant
          </span>
        </div>
      </div>
    </div>
  );
}
