"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { MfaSetupForm } from "@/features/identity/components/forms";
import { Shield, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";

export default function MfaSetupPage() {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);

  const handleMfaSetupSuccess = () => {
    setIsCompleted(true);

    toast.success("MFA enabled successfully! 🛡️", {
      style: {
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        color: "white",
        borderRadius: "12px",
        padding: "16px",
      },
      duration: 4000,
    });

    // Redirect after a delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
  };

  const handleCancel = () => {
    router.back();
  };

  if (isCompleted) {
    return (
      <div className="text-center space-y-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0f172a,-12px_-12px_24px_#334155] flex items-center justify-center animate-pulse">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>

        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4">
            MFA Setup Complete!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
            Your account is now protected by two-factor authentication
          </p>
        </div>

        <div className="bg-green-50/50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200/30 dark:border-green-800/30">
          <div className="flex items-start space-x-4">
            <Shield className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
            <div className="text-left">
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                Enhanced Security Active
              </h3>
              <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                <li>
                  • Your account is now protected against unauthorized access
                </li>
                <li>
                  • You will need your authenticator app for future logins
                </li>
                <li>• Keep your backup codes in a safe place</li>
                <li>• Consider enabling trusted devices for convenience</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-sm text-slate-500 dark:text-slate-400">
          Redirecting to dashboard in 3 seconds...
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
          Back
        </button>

        <div className="inline-flex items-center px-4 py-2 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-full border border-emerald-200/30 dark:border-emerald-800/30">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Security Setup
          </span>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200/30 dark:border-blue-800/30">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
              Why Enable MFA?
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
              Two-factor authentication adds an extra layer of security to your
              account, making it significantly harder for unauthorized users to
              gain access.
            </p>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Protects against password breaches</li>
              <li>• Prevents unauthorized account access</li>
              <li>• Meets enterprise security requirements</li>
              <li>• Can be used with multiple apps</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MFA Setup Form */}
      <MfaSetupForm
        onSuccess={handleMfaSetupSuccess}
        onCancel={handleCancel}
        className="w-full"
      />

      {/* Help Links */}
      <div className="text-center space-y-4">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Need help setting up MFA?{" "}
          <Link
            href="/help/mfa"
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
          >
            View setup guide
          </Link>
        </div>

        <div className="inline-flex items-center px-4 py-2 bg-white/40 dark:bg-slate-800/40 rounded-xl shadow-[2px_2px_4px_#bebebe,-2px_-2px_4px_#ffffff] dark:shadow-[2px_2px_4px_#0f172a,-2px_-2px_4px_#334155] border border-white/30 dark:border-slate-700/30">
          <Shield className="w-3 h-3 text-green-500 mr-2" />
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            TOTP Compatible with Google Authenticator, Authy, and more
          </span>
        </div>
      </div>
    </div>
  );
}
