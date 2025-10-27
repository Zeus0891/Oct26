"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { PasswordResetForm } from "@/features/identity/components/forms";
import {
  Lock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react";

export default function PasswordResetTokenPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [tokenStatus, setTokenStatus] = useState<
    "validating" | "valid" | "invalid" | "expired"
  >("validating");
  const [isResetComplete, setIsResetComplete] = useState(false);

  useEffect(() => {
    if (token) {
      validateToken(token);
    }
  }, [token]);

  const validateToken = async (resetToken: string) => {
    try {
      // Mock token validation - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate different token states
      if (resetToken === "invalid") {
        setTokenStatus("invalid");
      } else if (resetToken === "expired") {
        setTokenStatus("expired");
      } else {
        setTokenStatus("valid");
      }
    } catch {
      setTokenStatus("invalid");
    }
  };

  const handleResetSuccess = () => {
    setIsResetComplete(true);

    toast.success("Password updated successfully! 🎉", {
      style: {
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        color: "white",
        borderRadius: "12px",
        padding: "16px",
      },
      duration: 4000,
    });

    // Redirect to login after success
    setTimeout(() => {
      router.push("/login?message=password-reset-success");
    }, 3000);
  };

  const handleCancel = () => {
    router.push("/login");
  };

  // Validating token state
  if (tokenStatus === "validating") {
    return (
      <div className="text-center space-y-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0f172a,-12px_-12px_24px_#334155] flex items-center justify-center">
          <Lock className="w-12 h-12 text-white animate-pulse" />
        </div>

        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4">
            Validating Reset Link
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
            Verifying your password reset token...
          </p>
        </div>

        <div className="w-8 h-8 mx-auto">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  // Invalid token state
  if (tokenStatus === "invalid" || tokenStatus === "expired") {
    return (
      <div className="text-center space-y-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-2xl shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0f172a,-12px_-12px_24px_#334155] flex items-center justify-center">
          <AlertTriangle className="w-12 h-12 text-white" />
        </div>

        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4">
            {tokenStatus === "expired" ? "Link Expired" : "Invalid Reset Link"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
            {tokenStatus === "expired"
              ? "This password reset link has expired for security reasons."
              : "This password reset link is invalid or has already been used."}
          </p>
        </div>

        <div className="bg-red-50/50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200/30 dark:border-red-800/30">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
            <div className="text-left">
              <h3 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                What can you do?
              </h3>
              <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                <li>• Request a new password reset link</li>
                <li>• Make sure you use the latest email</li>
                <li>• Check that the link was not truncated</li>
                <li>• Contact support if issues persist</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/password-reset"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-105"
          >
            Request New Reset Link
          </Link>

          <div>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-105 border border-white/40 dark:border-slate-700/40"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reset complete state
  if (isResetComplete) {
    return (
      <div className="text-center space-y-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0f172a,-12px_-12px_24px_#334155] flex items-center justify-center animate-pulse">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>

        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4">
            Password Reset Complete!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
            Your password has been successfully updated. Redirecting to login...
          </p>
        </div>

        <div className="bg-green-50/50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200/30 dark:border-green-800/30">
          <div className="flex items-start space-x-4">
            <CheckCircle2 className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
            <div className="text-left">
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                Security Tips
              </h3>
              <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                <li>• Your new password is now active</li>
                <li>• Consider enabling two-factor authentication</li>
                <li>• Use a unique password for this account</li>
                <li>• Keep your password secure and private</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="w-8 h-8 mx-auto">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Valid token - show reset form
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleCancel}
          className="inline-flex items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-105 border border-white/40 dark:border-slate-700/40"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancel
        </button>

        <div className="inline-flex items-center px-4 py-2 bg-green-50/50 dark:bg-green-900/20 rounded-full border border-green-200/30 dark:border-green-800/30">
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Valid Reset Link
          </span>
        </div>
      </div>

      {/* Information */}
      <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200/30 dark:border-blue-800/30">
        <div className="flex items-start space-x-4">
          <Lock className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
              Create New Password
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
              Your reset link is valid. Please enter a strong new password
              below.
            </p>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Password must be at least 8 characters long</li>
              <li>• Include uppercase, lowercase, and numbers</li>
              <li>• Consider using special characters for extra security</li>
              <li>• Avoid using personal information</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Password Reset Form */}
      <PasswordResetForm
        token={token}
        onSuccess={handleResetSuccess}
        onCancel={handleCancel}
        className="w-full"
      />

      {/* Security Notice */}
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-white/40 dark:bg-slate-800/40 rounded-xl shadow-[2px_2px_4px_#bebebe,-2px_-2px_4px_#ffffff] dark:shadow-[2px_2px_4px_#0f172a,-2px_-2px_4px_#334155] border border-white/30 dark:border-slate-700/30">
          <Lock className="w-3 h-3 text-green-500 mr-2" />
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            This link expires in 60 minutes for security
          </span>
        </div>
      </div>
    </div>
  );
}
