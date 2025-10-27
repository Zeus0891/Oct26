"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { MfaVerifyForm } from "@/features/identity/components/forms";
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function MfaVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [isVerified, setIsVerified] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    // Check if user actually needs MFA verification
    // This could be based on session state or URL parameters
  }, []);

  const handleMfaSuccess = (verified: boolean) => {
    if (verified) {
      setIsVerified(true);

      toast.success("Authentication successful! 🎉", {
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
      }, 1500);
    } else {
      setAttemptCount((prev) => prev + 1);

      toast.error("Verification failed. Please try again.", {
        style: {
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          color: "white",
          borderRadius: "12px",
          padding: "16px",
        },
        duration: 4000,
      });
    }
  };

  const handleCancel = () => {
    router.push("/login");
  };

  const handleResendCode = () => {
    toast.success("New code requested", {
      style: {
        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        color: "white",
        borderRadius: "12px",
        padding: "16px",
      },
      duration: 3000,
    });
  };

  if (isVerified) {
    return (
      <div className="text-center space-y-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0f172a,-12px_-12px_24px_#334155] flex items-center justify-center animate-pulse">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>

        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4">
            Verification Successful!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
            Welcome back! Redirecting to your dashboard...
          </p>
        </div>

        <div className="w-8 h-8 mx-auto">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleCancel}
          className="inline-flex items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-105 border border-white/40 dark:border-slate-700/40"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </button>

        <div className="inline-flex items-center px-4 py-2 bg-purple-50/50 dark:bg-purple-900/20 rounded-full border border-purple-200/30 dark:border-purple-800/30">
          <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Two-Factor Authentication
          </span>
        </div>
      </div>

      {/* Attempt Warning */}
      {attemptCount > 0 && (
        <div className="bg-amber-50/50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-200/30 dark:border-amber-800/30">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">
                Verification Failed
              </h3>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {attemptCount === 1
                  ? "1 failed attempt"
                  : `${attemptCount} failed attempts`}
                . Please double-check your authenticator app and try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MFA Verification Form */}
      <MfaVerifyForm
        onSuccess={handleMfaSuccess}
        onCancel={handleCancel}
        allowBackupCodes={true}
        className="w-full"
      />

      {/* Help Section */}
      <div className="space-y-4">
        {/* Resend Options */}
        <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-6 shadow-[inset_4px_4px_8px_#e2e8f0,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] border border-white/40 dark:border-slate-700/40">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center">
            <RefreshCw className="w-5 h-5 mr-2" />
            Need a new code?
          </h3>

          <div className="space-y-3">
            <button
              onClick={handleResendCode}
              className="w-full p-3 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] border border-white/40 dark:border-slate-700/40 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Request New Code</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Get a fresh verification code
                  </div>
                </div>
                <RefreshCw className="w-4 h-4" />
              </div>
            </button>

            <Link
              href="/mfa-setup"
              className="block w-full p-3 bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 rounded-xl shadow-[2px_2px_4px_#bebebe,-2px_-2px_4px_#ffffff] dark:shadow-[2px_2px_4px_#0f172a,-2px_-2px_4px_#334155] hover:shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] transition-all duration-300 border border-white/30 dark:border-slate-700/30 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Reconfigure MFA</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Set up a new authenticator app
                  </div>
                </div>
                <Shield className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Having trouble?{" "}
            <Link
              href="/help/mfa"
              className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              View MFA troubleshooting guide
            </Link>
          </p>

          <div className="inline-flex items-center px-4 py-2 bg-white/40 dark:bg-slate-800/40 rounded-xl shadow-[2px_2px_4px_#bebebe,-2px_-2px_4px_#ffffff] dark:shadow-[2px_2px_4px_#0f172a,-2px_-2px_4px_#334155] border border-white/30 dark:border-slate-700/30">
            <Shield className="w-3 h-3 text-purple-500 mr-2" />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Your account security is protected by MFA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
