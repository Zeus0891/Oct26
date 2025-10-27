"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { PasswordResetForm } from "@/features/identity/components/forms";
import { ArrowLeft, Lock, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

export default function PasswordResetPage() {
  const router = useRouter();
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleResetSuccess = () => {
    setIsEmailSent(true);

    toast.success("Password reset email sent! 📧", {
      style: {
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        color: "white",
        borderRadius: "12px",
        padding: "16px",
      },
      duration: 4000,
    });
  };

  const handleCancel = () => {
    router.push("/login");
  };

  if (isEmailSent) {
    return (
      <div className="text-center space-y-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0f172a,-12px_-12px_24px_#334155] flex items-center justify-center">
          <Mail className="w-12 h-12 text-white" />
        </div>

        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4">
            Check Your Email
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
            We have sent password reset instructions to your email address.
          </p>
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200/30 dark:border-blue-800/30">
          <div className="flex items-start space-x-4">
            <CheckCircle2 className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
            <div className="text-left">
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                What happens next?
              </h3>
              <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                <li>• Check your email inbox for reset instructions</li>
                <li>• Click the secure reset link in the email</li>
                <li>• Create a new strong password</li>
                <li>• Sign in with your new credentials</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Did not receive the email? Check your spam folder or{" "}
            <button
              onClick={() => setIsEmailSent(false)}
              className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
            >
              try again
            </button>
          </p>

          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-105 border border-white/40 dark:border-slate-700/40"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
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

        <div className="inline-flex items-center px-4 py-2 bg-amber-50/50 dark:bg-amber-900/20 rounded-full border border-amber-200/30 dark:border-amber-800/30">
          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 mr-2" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Password Recovery
          </span>
        </div>
      </div>

      {/* Information Section */}
      <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-6 shadow-[inset_4px_4px_8px_#e2e8f0,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] border border-white/40 dark:border-slate-700/40">
        <div className="flex items-start space-x-4">
          <AlertCircle className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Forgot your password?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              No worries! Enter your email address below and we will send you
              instructions to create a new password.
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Reset link expires in 1 hour for security</li>
              <li>• Check your spam folder if email does not arrive</li>
              <li>• Contact support if you continue having issues</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Password Reset Form */}
      <PasswordResetForm
        onSuccess={handleResetSuccess}
        onCancel={handleCancel}
        className="w-full"
      />

      {/* Additional Help */}
      <div className="space-y-4">
        {/* Alternative Options */}
        <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200/30 dark:border-blue-800/30">
          <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">
            Still having trouble?
          </h3>

          <div className="space-y-3">
            <Link
              href="/help/account-recovery"
              className="block p-3 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] border border-white/40 dark:border-slate-700/40"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-blue-700 dark:text-blue-300">
                    Account Recovery Guide
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Step-by-step recovery process
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </div>
            </Link>

            <Link
              href="/contact-support"
              className="block p-3 bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 rounded-xl shadow-[2px_2px_4px_#bebebe,-2px_-2px_4px_#ffffff] dark:shadow-[2px_2px_4px_#0f172a,-2px_-2px_4px_#334155] hover:shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] transition-all duration-300 border border-white/30 dark:border-slate-700/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-blue-600 dark:text-blue-400">
                    Contact Support
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Get help from our team
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </div>
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/40 dark:bg-slate-800/40 rounded-xl shadow-[2px_2px_4px_#bebebe,-2px_-2px_4px_#ffffff] dark:shadow-[2px_2px_4px_#0f172a,-2px_-2px_4px_#334155] border border-white/30 dark:border-slate-700/30">
            <Lock className="w-3 h-3 text-green-500 mr-2" />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Secure password reset with email verification
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
